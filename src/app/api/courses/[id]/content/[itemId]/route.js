import { fail, handler, ok, requireUserForWrite } from "@/lib/api";
import { getCourseWithContent, toObjectId } from "@/lib/data";
import { services } from "@/lib/mongodb";
import { objectIdString } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Removes a lesson. Owner only. */
export const DELETE = handler(async (req, ctx) => {
  const { id, itemId } = await ctx.params;
  if (!objectIdString.safeParse(id).success) return fail(400, "Invalid course id.");
  // Lesson ids are UUIDs we generated; anything else can't match a document
  // and is rejected before it reaches the query.
  if (!/^[0-9a-f-]{36}$/i.test(itemId)) return fail(400, "Invalid lesson id.");

  const user = await requireUserForWrite(req);

  const course = await getCourseWithContent(id);
  if (!course) return fail(404, "Course not found.");
  if (course.instructorEmail !== user.email) {
    return fail(403, "Only the instructor who created this course can remove content.");
  }

  const col = await services();
  const result = await col.updateOne(
    { _id: toObjectId(id) },
    { $pull: { content: { id: itemId } } }
  );

  if (result.modifiedCount === 0) return fail(404, "Lesson not found.");
  return ok({ acknowledged: true });
});
