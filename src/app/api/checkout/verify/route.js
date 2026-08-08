import {
  fail,
  handler,
  ok,
  rateLimited,
  readJson,
  requireUserForWrite,
} from "@/lib/api";
import { recordPaidEnrollment } from "@/lib/enrollment";
import { rateLimit } from "@/lib/ratelimit";
import { requireStripe } from "@/lib/stripe";
import { firstIssue, verifyCheckoutSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Confirms a checkout when the browser lands back on the success URL.
 *
 * The Stripe webhook is the authoritative path — it fires even if the customer
 * closes the tab. This exists so the page can unlock immediately instead of
 * waiting for webhook delivery, and it re-reads the session from Stripe rather
 * than trusting the query string.
 *
 * It is a POST, not a GET: it changes state, so it must not be reachable by a
 * cross-site image tag or a link prefetch.
 */
export const POST = handler(async (req) => {
  const user = await requireUserForWrite(req);
  const stripe = requireStripe();

  const limit = await rateLimit("checkout:verify", user.uid, 30, 15 * 60 * 1000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const parsed = verifyCheckoutSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, firstIssue(parsed.error));

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
  } catch {
    return fail(404, "We couldn't find that checkout session.");
  }

  // The session must belong to the person asking about it, otherwise anyone
  // holding a session id could enrol themselves against someone else's payment.
  if (session.metadata?.email?.toLowerCase() !== user.email) {
    return fail(403, "That checkout session doesn't belong to your account.");
  }

  const result = await recordPaidEnrollment(session);
  if (!result.enrolled) {
    return fail(402, result.reason ?? "Payment not completed.", { enrolled: false });
  }

  return ok({ enrolled: true, serviceId: result.serviceId });
});
