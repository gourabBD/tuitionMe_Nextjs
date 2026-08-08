import {
  fail,
  handler,
  logEvent,
  ok,
  rateLimited,
  readJson,
  requireUserForWrite,
} from "@/lib/api";
import { getCourse, isEnrolled } from "@/lib/data";
import { appUrl, stripeCurrency } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";
import { requireStripe } from "@/lib/stripe";
import { checkoutSchema, firstIssue } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Starts a Stripe Checkout session for a course.
 *
 * Price and buyer are both server-derived: the amount comes from the course
 * document and the email from the session cookie, so neither can be tampered
 * with by editing the request.
 */
export const POST = handler(async (req) => {
  const user = await requireUserForWrite(req);
  const stripe = requireStripe();

  const limit = await rateLimit("checkout", user.uid, 20, 60 * 60 * 1000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const parsed = checkoutSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, firstIssue(parsed.error));
  const { serviceId } = parsed.data;

  const course = await getCourse(serviceId);
  if (!course) return fail(404, "Course not found.");

  if (course.instructorEmail === user.email) {
    return fail(409, "You already own this course — you're its instructor.");
  }
  if (await isEnrolled(user.email, serviceId)) {
    return fail(409, "You already own this course.");
  }

  const base = appUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: stripeCurrency(),
          product_data: { name: course.subject },
          // Course prices are stored as a plain number (e.g. 1500) and charged
          // as that many minor units of STRIPE_CURRENCY (so 1500 -> $15.00).
          // Multiplying by 100 here would charge 100x the listed price.
          unit_amount: Math.round(course.cost),
        },
        quantity: 1,
      },
    ],
    // Only this server writes metadata, so the webhook can trust it.
    metadata: { serviceId, email: user.email },
    success_url: `${base}/services/${serviceId}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/services/${serviceId}?checkout=cancelled`,
  });

  logEvent("checkout.started", { serviceId, session: session.id });
  return ok({ url: session.url });
});
