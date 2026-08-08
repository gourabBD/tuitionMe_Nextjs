"use client";

import { PhotoProvider, PhotoView } from "react-photo-view";
import StarRating from "./StarRating";
import { avatarFor } from "@/lib/course";

export default function ReviewBody({ review }) {
  const image = review.photoURL || avatarFor(review.name);

  return (
    <div className="tm-surface p-3 h-100">
      <div className="d-flex align-items-center gap-2 mb-2">
        <PhotoProvider>
          <PhotoView src={image}>
            <img className="userImage" src={image} alt={review.name} />
          </PhotoView>
        </PhotoProvider>
        <div>
          <div className="fw-semibold">{review.name}</div>
          <div className="tm-text-muted" style={{ fontSize: "0.78rem" }}>
            {review.subject}
          </div>
        </div>
      </div>
      {typeof review.rating === "number" && <StarRating value={review.rating} size={13} />}
      <p
        className="tm-text-muted mt-2 mb-0"
        style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}
      >
        {review.userReview}
      </p>
    </div>
  );
}
