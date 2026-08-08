import "server-only";
import Stripe from "stripe";
import { stripeSecretKey } from "./env";
import { HttpError } from "./api";

let cached = null;

/** Returns the Stripe client, or null when payments aren't configured. */
export function getStripe() {
  const key = stripeSecretKey();
  if (!key) return null;
  if (!cached) {
    cached = new Stripe(key, {
      // Keeps a transient network blip from surfacing as a failed checkout.
      maxNetworkRetries: 2,
      timeout: 15_000,
    });
  }
  return cached;
}

export function requireStripe() {
  const stripe = getStripe();
  if (!stripe) {
    throw new HttpError(
      503,
      "Payments are not configured on this server (missing STRIPE_SECRET_KEY)."
    );
  }
  return stripe;
}
