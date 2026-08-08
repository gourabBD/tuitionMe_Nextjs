import { notFound, redirect } from "next/navigation";

import ReviewForm from "@/components/reviews/ReviewForm";
import { getSession } from "@/lib/auth";
import { getReview } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit review",
  robots: { index: false, follow: false },
};

export default async function EditReviewPage({ params }) {
  const { id } = await params;

  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/edit/${id}`)}`);

  const review = await getReview(id);
  if (!review) notFound();

  // Someone else's review is indistinguishable from a missing one — the page
  // shouldn't confirm that a given review id exists to a non-author.
  if (review.email !== user.email) notFound();

  return (
    <ReviewForm
      mode="edit"
      reviewId={review._id}
      courseTitle={review.subject}
      initialText={review.userReview}
      initialRating={review.rating ?? 5}
    />
  );
}
