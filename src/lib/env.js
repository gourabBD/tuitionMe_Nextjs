import "server-only";

/**
 * Server-side environment access.
 *
 * Everything here is read lazily rather than at module load so that a missing
 * *optional* integration (Stripe) degrades to a clean 503 instead of taking
 * the whole app down, while a missing *required* value fails loudly the first
 * time something actually needs it.
 */

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example.`
    );
  }
  return value;
}

export const isProduction = process.env.NODE_ENV === "production";

/** Full MongoDB connection string. */
export function mongoUri() {
  return required("MONGODB_URI");
}

export function mongoDbName() {
  return process.env.MONGODB_DB || "tuition-me";
}

export function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || null;
}

export function stripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || null;
}

export function stripeCurrency() {
  return (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
}

/**
 * Public origin of this deployment, used to build Stripe redirect URLs.
 * Falls back to the Vercel-provided host so a preview deployment redirects
 * back to itself rather than to production.
 */
export function appUrl() {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
