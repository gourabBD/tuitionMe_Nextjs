import {
  fail,
  handler,
  ok,
  rateLimited,
  readJson,
  requireUserForWrite,
} from "@/lib/api";
import { getCourse, listReviews } from "@/lib/data";
import { reviews } from "@/lib/mongodb";
import { rateLimit } from "@/lib/ratelimit";
import { createReviewSchema, firstIssue, objectIdString } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  const serviceId = req.nextUrl.searchParams.get("serviceId") ?? undefined;
  if (serviceId && !objectIdString.safeParse(serviceId).success) {
    return fail(400, "Invalid course id.");
  }
  return ok(await listReviews(serviceId));
});

/**
 * Posts a review.
 *
 * Author identity (email, display name, avatar) is taken from the session and
 * the course title from the database. Previously all of it came from the
 * request body, so a review could be published under anyone's name.
 */
export const POST = handler(async (req) => {
  const user = await requireUserForWrite(req);

  const limit = await rateLimit("review:create", user.uid, 20, 60 * 60 * 1000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const parsed = createReviewSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, firstIssue(parsed.error));
  const { serviceId, userReview, rating } = parsed.data;

  const course = await getCourse(serviceId);
  if (!course) return fail(404, "Course not found.");

  const col = await reviews();
  const existing = await col.findOne({ email: user.email, serviceId });
  if (existing) {
    return fail(
      409,
      "You've already reviewed this course — edit your existing review instead."
    );
  }

  const result = await col.insertOne({
    email: user.email,
    name: user.name,
    photoURL: user.picture,
    userReview,
    rating,
    serviceId,
    subject: course.subject,
    createdAt: new Date(),
  });

  return ok(
    { acknowledged: true, insertedId: result.insertedId.toString() },
    { status: 201 }
  );
});
