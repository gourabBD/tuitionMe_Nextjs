import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import ManageLessons from "@/components/instructor/ManageLessons";
import { getSession } from "@/lib/auth";
import { getCourse, resolveCourseAccess } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage lessons",
  robots: { index: false, follow: false },
};

export default async function ManageCoursePage({ params }) {
  const { id } = await params;

  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/manage/${id}`)}`);

  const course = await getCourse(id);
  if (!course) notFound();

  // Ownership is resolved server-side, so a non-owner never receives the
  // lesson list in the first place — not even hidden behind a conditional.
  const access = await resolveCourseAccess(id, user.email);

  if (access.state !== "owner") {
    return (
      <div className="tm-page tm-section">
        <div className="tm-container tm-empty">
          <h4>You don&apos;t have access to manage this course</h4>
          <p>Only the instructor who created it can add or remove lessons.</p>
          <Link href={`/services/${id}`} className="btn-tm-outline text-decoration-none">
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page tm-section">
      <div className="tm-container" style={{ maxWidth: 760 }}>
        <span className="tm-eyebrow">Instructor tools</span>
        <h2 className="tm-section-title">Manage lessons</h2>
        <p className="tm-section-sub">
          {course.subject} — students only see these once they purchase the course.
        </p>

        <ManageLessons
          courseId={course._id}
          courseTitle={course.subject}
          initialLessons={access.lessons}
        />
      </div>
    </div>
  );
}
