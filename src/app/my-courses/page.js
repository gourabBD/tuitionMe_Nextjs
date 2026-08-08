import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { listCoursesByInstructor } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Courses I teach",
  robots: { index: false, follow: false },
};

export default async function MyCoursesPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=%2Fmy-courses");

  const courses = await listCoursesByInstructor(user.email);

  return (
    <div className="tm-page tm-section">
      <div className="tm-container">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
          <div>
            <span className="tm-eyebrow">Instructor dashboard</span>
            <h2 className="tm-section-title">Courses I teach</h2>
          </div>
          <Link href="/addservice" className="btn-tm-primary text-decoration-none">
            Publish a new course
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="tm-empty">
            <h4>You haven&apos;t published any courses yet</h4>
            <p>Create one and start adding lessons.</p>
          </div>
        ) : (
          <div className="d-grid gap-2 mt-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="tm-surface p-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
              >
                <div>
                  <div className="fw-semibold">{course.subject}</div>
                  <div className="tm-text-muted" style={{ fontSize: "0.85rem" }}>
                    {course.category} · ৳{course.cost}/mo
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Link
                    href={`/services/${course._id}`}
                    className="btn-tm-ghost text-decoration-none"
                  >
                    View
                  </Link>
                  <Link
                    href={`/manage/${course._id}`}
                    className="btn-tm-outline text-decoration-none"
                  >
                    Manage lessons
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
