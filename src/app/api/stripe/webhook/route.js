import { NextResponse } from "next/server";
import { logEvent } from "@/lib/api";
import { recordPaidEnrollment } from "@/lib/enrollment";
import { stripeWebhookSecret } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Authoritative payment confirmation.
 *
 * This is the one endpoint that is *meant* to be called cross-origin, so it
 * deliberately skips the same-origin check — and replaces it with something
 * stronger: every request must carry a valid `stripe-signature` computed with
 * the webhook signing secret. Without that check an unauthenticated POST here
 * would be able to grant free access to any course.
 *
 * The raw body is required for signature verification, hence `req.text()`
 * rather than `req.json()`.
 */
export async function POST(req) {
  const stripe = getStripe();
  const secret = stripeWebhookSecret();
  if (!stripe || !secret) {
    return NextResponse.json({ message: "Webhooks are not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Missing signature." }, { status: 400 });
  }

  const payload = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    // Never echo the reason — that would help someone iterate towards a forgery.
    return NextResponse.json({ message: "Invalid signature." }, { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await recordPaidEnrollment(event.data.object);
    } else {
      logEvent("stripe.webhook.ignored", { type: event.type });
    }
  } catch (err) {
    console.error("[stripe] webhook handling failed:", err);
    // A 500 makes Stripe retry with backoff, which is what we want for a
    // transient database problem.
    return NextResponse.json({ message: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
