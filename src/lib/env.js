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
  // Deliberately NOT "tuition-me": that database belongs to the older
  // CRA/Express deployments, which are still live. A missing env var must not
  // silently point this app at their data.
  return process.env.MONGODB_DB || "tuitionMeNext";
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
 *
 * Both Vercel and Render publish their own hostname, so a fresh deployment
 * redirects back to itself with no configuration — and a preview/branch
 * deployment returns to the preview rather than to production. `APP_URL` still
 * wins when set, which is what a custom domain needs.
 */
export function appUrl() {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  // Render injects this automatically; it already includes the scheme.
  const render = process.env.RENDER_EXTERNAL_URL;
  if (render) return render.replace(/\/$/, "");

  return "http://localhost:3000";
}
