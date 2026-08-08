import "server-only";
import { enrollments, rateLimits, reviews, services, users } from "./mongodb";

/**
 * Creates the indexes the app relies on.
 *
 * Deliberately fire-and-forget and run once per process from
 * `instrumentation.js`: doing this inline on a request added several Atlas
 * round trips to the critical path of the first request after an idle period,
 * which was on its own enough to blow past the client's timeout in the
 * previous version of this app.
 *
 * `createIndex` is idempotent, so re-running it on a new instance is a no-op
 * once the index exists.
 */
export async function ensureIndexes() {
  const [serviceCol, reviewCol, enrollmentCol, userCol, rateLimitCol] =
    await Promise.all([
      services(),
      reviews(),
      enrollments(),
      users(),
      rateLimits(),
    ]);

  await Promise.all([
    serviceCol.createIndex({ createdAt: -1 }),
    serviceCol.createIndex({ instructorEmail: 1, createdAt: -1 }),
    serviceCol.createIndex({ category: 1 }),
    serviceCol.createIndex({ bestseller: -1, rating: -1, createdAt: -1 }),

    reviewCol.createIndex({ serviceId: 1, createdAt: -1 }),
    reviewCol.createIndex({ email: 1, createdAt: -1 }),

    // One paid enrollment per (student, course) — this is what makes the
    // checkout flow idempotent even if Stripe delivers the webhook twice and
    // the browser hits /api/checkout/verify at the same moment.
    enrollmentCol.createIndex({ email: 1, serviceId: 1 }, { unique: true }),
    enrollmentCol.createIndex(
      { stripeSessionId: 1 },
      { unique: true, sparse: true }
    ),

    // One account per address. This is also the last line of defence against
    // two concurrent registrations creating duplicate accounts for the same
    // email, which would make "who owns this course" ambiguous.
    userCol.createIndex({ email: 1 }, { unique: true }),

    rateLimitCol.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
