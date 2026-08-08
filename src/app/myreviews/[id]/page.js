import { notFound, redirect } from "next/navigation";

import ReviewForm from "@/components/reviews/ReviewForm";
import { getSession } from "@/lib/auth";
import { getCourse } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Write a review",
  robots: { index: false, follow: false },
};

/** Write a review for a course. `[id]` is the course id. */
export default async function WriteReviewPage({ params }) {
  const { id } = await params;

  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/myreviews/${id}`)}`);

  const course = await getCourse(id);
  if (!course) notFound();

  return (
    <ReviewForm mode="create" courseId={course._id} courseTitle={course.subject} />
  );
}
