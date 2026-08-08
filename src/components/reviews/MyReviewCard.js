"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import toast from "react-hot-toast";

import StarRating from "@/components/ui/StarRating";
import { ApiError, apiDelete } from "@/lib/api-client";
import { avatarFor } from "@/lib/course";

export default function MyReviewCard({ review }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    setDeleting(true);
    try {
      await apiDelete(`/api/reviews/${review._id}`);
      toast.success("Deleted successfully!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete the review.");
      setDeleting(false);
    }
  };

  return (
    <div className="tm-surface p-3 h-100 d-flex flex-column">
      <img
        style={{ height: 150, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
        src={review.photoURL || avatarFor(review.name)}
        alt=""
      />
      <h5 className="mt-3 mb-0">{review.name}</h5>
      <p className="tm-text-muted mb-1" style={{ fontSize: "0.85rem" }}>
        {review.subject}
      </p>
      {typeof review.rating === "number" && <StarRating value={review.rating} size={13} />}
      <p
        className="tm-text-muted mt-2 flex-grow-1"
        style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}
      >
        {review.userReview}
      </p>

      <div className="d-flex gap-2 mt-2">
        <Button
          className="btn-tm-outline border-1 flex-grow-1"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
        <Link href={`/edit/${review._id}`} className="flex-grow-1">
          <Button className="btn-tm-primary border-0 w-100">Edit</Button>
        </Link>
      </div>
    </div>
  );
}
