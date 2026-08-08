import { randomUUID } from "node:crypto";
import {
  fail,
  handler,
  ok,
  rateLimited,
  readJson,
  requireUser,
  requireUserForWrite,
} from "@/lib/api";
import { getCourseWithContent, resolveCourseAccess, toObjectId } from "@/lib/data";
import { services } from "@/lib/mongodb";
import { rateLimit } from "@/lib/ratelimit";
import { firstIssue, lessonSchema, objectIdString } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_LESSONS = 200;

/**
 * The paid lesson list. Visible to the instructor who owns the course and to
 * students with a completed payment — nobody else, and the viewer's identity
 * comes from the session cookie.
 *
 * Previously this was `?email=` on a public URL: anyone who knew (or guessed)
 * a buyer's email address could read the whole paid course.
 */
export const GET = handler(async (_req, ctx) => {
  const { id } = await ctx.params;
  if (!objectIdString.safeParse(id).success) return fail(400, "Invalid course id.");

  const user = await requireUser();
  const access = await resolveCourseAccess(id, user.email);

  if (access.state === "locked") {
    return fail(403, "Purchase this course to access its content.", { locked: true });
  }

  return ok({ content: access.lessons, role: access.state });
});

/** Adds a lesson. Owner only. */
export const POST = handler(async (req, ctx) => {
  const { id } = await ctx.params;
  if (!objectIdString.safeParse(id).success) return fail(400, "Invalid course id.");

  const user = await requireUserForWrite(req);

  const limit = await rateLimit("lesson:create", user.uid, 60, 60 * 60 * 1000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const parsed = lessonSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, firstIssue(parsed.error));

  const course = await getCourseWithContent(id);
  if (!course) return fail(404, "Course not found.");
  if (course.instructorEmail !== user.email) {
    return fail(403, "Only the instructor who created this course can add content.");
  }
  if ((course.content?.length ?? 0) >= MAX_LESSONS) {
    return fail(409, `A course can hold at most ${MAX_LESSONS} lessons.`);
  }

  const item = {
    id: randomUUID(),
    type: parsed.data.type,
    title: parsed.data.title,
    url: parsed.data.url,
    addedAt: new Date(),
  };

  const col = await services();
  await col.updateOne({ _id: toObjectId(id) }, { $push: { content: item } });

  return ok(
    {
      acknowledged: true,
      item: { id: item.id, type: item.type, title: item.title, url: item.url },
    },
    { status: 201 }
  );
});
