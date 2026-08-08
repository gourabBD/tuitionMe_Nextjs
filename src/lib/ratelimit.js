import "server-only";
import { rateLimits } from "./mongodb";

/**
 * Fixed-window rate limiter backed by MongoDB.
 *
 * An in-process counter would be useless here: on Vercel every concurrent
 * request can land on a different instance, so a per-instance map lets an
 * attacker multiply their budget by the number of warm lambdas. Keeping the
 * counter in the database that every instance already talks to costs one extra
 * round trip on writes and actually holds.
 *
 * Rows carry `expiresAt` and are reaped by a TTL index (see `ensureIndexes`).
 */
export async function rateLimit(bucket, identifier, limit, windowMs) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const _id = `${bucket}:${identifier}:${windowStart}`;

  try {
    const col = await rateLimits();
    const doc = await col.findOneAndUpdate(
      { _id },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(resetAt) },
      },
      { upsert: true, returnDocument: "after" }
    );

    const count = doc?.count ?? 1;
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.ceil((resetAt - now) / 1000),
    };
  } catch {
    // A limiter that fails closed would take the whole app down with the
    // database; a limiter that fails open only loses throttling for as long as
    // Mongo is unreachable — during which nothing can be written anyway.
    return { ok: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/**
 * Best-effort client identity for rate limiting. `x-forwarded-for` is only
 * trustworthy because Vercel (and any sane reverse proxy) rewrites it; it is
 * never used for authorisation, only for bucketing.
 */
export function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
