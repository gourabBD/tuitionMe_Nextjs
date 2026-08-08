import { redirect } from "next/navigation";

import MyReviewCard from "@/components/reviews/MyReviewCard";
import { getSession } from "@/lib/auth";
import { listReviewsByAuthor } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My reviews",
  robots: { index: false, follow: false },
};

export default async function MyReviewsPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=%2Fmyreview");

  // Queried by the session's email, so this can only ever return your own
  // reviews. The old version fetched every review on the site and filtered in
  // the browser.
  const reviews = await listReviewsByAuthor(user.email);

  return (
    <div className="tm-page tm-section">
      <div className="tm-container">
        <span className="tm-eyebrow">Your activity</span>
        <h2 className="tm-section-title">My reviews</h2>

        {reviews.length === 0 ? (
          <div className="tm-empty">
            <h4>No reviews yet</h4>
            <p>Enroll in a course and share your feedback to see it here.</p>
          </div>
        ) : (
          <div className="row row-cols-lg-3 row-cols-sm-2 row-cols-1 g-4">
            {reviews.map((review) => (
              <div className="col" key={review._id}>
                <MyReviewCard review={review} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
