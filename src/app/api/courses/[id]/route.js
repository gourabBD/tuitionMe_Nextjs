import { fail, handler, ok } from "@/lib/api";
import { getCourse } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (_req, ctx) => {
  const { id } = await ctx.params;
  const course = await getCourse(id);
  if (!course) return fail(404, "Course not found.");
  return ok(course);
});
