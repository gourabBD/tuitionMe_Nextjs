"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import toast from "react-hot-toast";

import StarRatingInput from "@/components/ui/StarRatingInput";
import { ApiError, apiPatch, apiPost } from "@/lib/api-client";

/**
 * One form for both writing and editing a review.
 *
 * Only the rating and the text are ever sent — the author's name, email and
 * avatar are attached by the server from the session, so a review can't be
 * published under someone else's identity.
 */
export default function ReviewForm({
  mode,
  courseId,
  courseTitle,
  reviewId,
  initialText = "",
  initialRating = 5,
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const userReview = form.elements.namedItem("userReview").value.trim();

    if (userReview.length < 3) {
      toast.error("Please write a little more.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "create") {
        await apiPost("/api/reviews", { serviceId: courseId, userReview, rating });
        toast.success("Review posted!");
        router.push(`/services/${courseId}`);
      } else {
        await apiPatch(`/api/reviews/${reviewId}`, { userReview, rating });
        toast.success("Review updated");
        router.push("/myreview");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save your review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tm-auth-wrap">
      <div className="tm-auth-card">
        <h3 className="mb-1">
          {mode === "create" ? "Review this course" : "Edit your review"}
        </h3>
        {courseTitle && <p className="tm-text-muted mb-4">{courseTitle}</p>}

        <Form onSubmit={handleSubmit} className="tm-form">
          <Form.Group className="mb-3">
            <Form.Label>Your rating</Form.Label>
            <div>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="userReview">
            <Form.Label>Your review</Form.Label>
            <textarea
              id="userReview"
              name="userReview"
              rows={5}
              maxLength={2000}
              defaultValue={initialText}
              placeholder="Share your experience with this course..."
              required
            />
          </Form.Group>

          <Button className="btn-tm-primary w-100 border-0" type="submit" disabled={busy}>
            {busy
              ? "Saving…"
              : mode === "create"
                ? "Submit review"
                : "Save changes"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
