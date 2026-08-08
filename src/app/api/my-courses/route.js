import { handler, ok, requireUser } from "@/lib/api";
import { listCoursesByInstructor } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Courses the signed-in instructor has published. */
export const GET = handler(async () => {
  const user = await requireUser();
  return ok(await listCoursesByInstructor(user.email));
});
