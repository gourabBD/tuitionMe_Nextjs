import { redirect } from "next/navigation";

import AddCourseForm from "@/components/instructor/AddCourseForm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Publish a course",
  robots: { index: false, follow: false },
};

export default async function AddServicePage() {
  // Middleware already bounces cookie-less visitors, but that only proves a
  // cookie exists. This is the check that actually matters.
  const user = await getSession();
  if (!user) redirect("/login?next=%2Faddservice");

  return (
    <div className="tm-page tm-section">
      <div className="tm-container" style={{ maxWidth: 720 }}>
        <span className="tm-eyebrow">Instructor tools</span>
        <h2 className="tm-section-title">Publish a new course</h2>
        <p className="tm-section-sub">
          Fill in the details below to list your course on Tuition Me. You&apos;ll add
          video/PDF lessons on the next screen — students only get access once they
          purchase it.
        </p>

        <AddCourseForm defaultInstructorName={user.name} />
      </div>
    </div>
  );
}
