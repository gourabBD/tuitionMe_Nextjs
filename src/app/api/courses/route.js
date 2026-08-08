import {
  fail,
  handler,
  logEvent,
  ok,
  rateLimited,
  readJson,
  requireUserForWrite,
} from "@/lib/api";
import { listCourses } from "@/lib/data";
import { services } from "@/lib/mongodb";
import { rateLimit } from "@/lib/ratelimit";
import { courseQuerySchema, createCourseSchema, firstIssue } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = courseQuerySchema.safeParse(params);
  if (!parsed.success) return fail(400, firstIssue(parsed.error));

  return ok(await listCourses(parsed.data));
});

/**
 * Publishes a course.
 *
 * The owning email comes from the session, never from the request body. In the
 * previous version `instructorEmail` was whatever the client sent, so anyone
 * could publish a course attributed to — and later editable by — someone else.
 */
export const POST = handler(async (req) => {
  const user = await requireUserForWrite(req);

  const limit = await rateLimit("course:create", user.uid, 10, 60 * 60 * 1000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const parsed = createCourseSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, firstIssue(parsed.error));
  const input = parsed.data;

  if (input.originalCost !== undefined && input.originalCost <= input.cost) {
    return fail(400, "Original price must be higher than the current price.");
  }

  const doc = {
    subject: input.subject,
    category: input.category,
    instructor: input.instructor,
    instructorEmail: user.email,
    instructorUid: user.uid,
    img: input.img,
    description: input.description,
    class: input.class,
    days: input.days,
    level: input.level,
    cost: input.cost,
    originalCost: input.originalCost,
    bestseller: false,
    // Ratings and student counts are derived from real reviews/enrolments —
    // not something the publisher gets to set.
    content: [],
    createdAt: new Date(),
  };

  const col = await services();
  const result = await col.insertOne(doc);
  logEvent("course.created", { id: result.insertedId.toString(), by: user.uid });

  return ok(
    { acknowledged: true, insertedId: result.insertedId.toString() },
    { status: 201 }
  );
});
