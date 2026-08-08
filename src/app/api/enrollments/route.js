import { handler, ok, requireUser } from "@/lib/api";
import { getCourse, listEnrolledCourseIds } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Courses the signed-in student has paid for. Scoped to the session — the
 * previous `?email=` version let anyone enumerate anyone else's purchases.
 */
export const GET = handler(async () => {
  const user = await requireUser();
  const ids = await listEnrolledCourseIds(user.email);
  const courses = await Promise.all(ids.map((id) => getCourse(id)));
  return ok(courses.filter(Boolean));
});
