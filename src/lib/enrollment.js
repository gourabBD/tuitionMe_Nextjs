import "server-only";
import { enrollments } from "./mongodb";
import { logEvent } from "./api";

/**
 * Records a paid enrollment from a completed Stripe Checkout Session.
 *
 * Called from two places that can race: the Stripe webhook and the browser
 * landing back on the success URL. The write is an idempotent upsert with
 * `$setOnInsert`, and `{email, serviceId}` carries a unique index, so
 * whichever arrives first wins and the second is a harmless no-op.
 *
 * The buyer and course are read from the session's `metadata`, which only this
 * server ever sets — not from anything the browser sends back.
 */
export async function recordPaidEnrollment(session) {
  if (session.payment_status !== "paid") {
    return { enrolled: false, reason: "Payment not completed." };
  }

  const serviceId = session.metadata?.serviceId;
  const email = session.metadata?.email?.toLowerCase();
  if (!serviceId || !email) {
    return { enrolled: false, reason: "Session is missing course/buyer metadata." };
  }

  const col = await enrollments();
  try {
    await col.updateOne(
      { email, serviceId },
      {
        $setOnInsert: {
          email,
          serviceId,
          amount: session.amount_total,
          currency: session.currency,
          stripeSessionId: session.id,
          status: "paid",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (err) {
    // A duplicate-key error here means the concurrent writer got there first,
    // which is exactly the outcome we wanted.
    if (err?.code !== 11000) throw err;
  }

  logEvent("enrollment.recorded", { serviceId, session: session.id });
  return { enrolled: true, serviceId };
}
