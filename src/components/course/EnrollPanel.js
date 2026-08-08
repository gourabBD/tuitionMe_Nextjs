"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "react-bootstrap/Button";
import { BsCheckCircleFill } from "react-icons/bs";
import toast from "react-hot-toast";

import { useAuth } from "@/components/providers/AuthProvider";
import { ApiError, apiPost } from "@/lib/api-client";

/**
 * The buy button, plus the handling of Stripe's redirect back to this page.
 *
 * Stripe navigates the whole browser to `?checkout=success&session_id=…`, so
 * this runs on a fresh page load. It confirms the payment with the server
 * (which re-reads the session from Stripe — the query string is never trusted)
 * and then refreshes the server-rendered page so the lesson list appears
 * without a manual reload.
 */
export default function EnrollPanel({ courseId, cost, hasAccess, isOwner }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enrolling, setEnrolling] = useState(false);

  // The user may refresh the success URL, and React StrictMode runs effects
  // twice in dev; these keep the confirmation to exactly one call.
  const verifiedRef = useRef(false);
  const cancelledRef = useRef(false);

  const checkoutState = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (checkoutState === "cancelled" && !cancelledRef.current) {
      cancelledRef.current = true;
      toast("Checkout cancelled — you were not charged.");
      router.replace(`/services/${courseId}`);
      return;
    }

    if (checkoutState !== "success" || !sessionId) return;
    // On a full page navigation the auth provider may not have resolved yet;
    // wait for it so the request actually carries a session.
    if (!user || verifiedRef.current) return;

    verifiedRef.current = true;
    apiPost("/api/checkout/verify", { sessionId })
      .then(() => {
        toast.success("Payment successful — you now have access to this course!");
        router.replace(`/services/${courseId}`);
        router.refresh();
      })
      .catch((err) => {
        toast.error(
          err instanceof ApiError ? err.message : "Could not verify your payment."
        );
        router.replace(`/services/${courseId}`);
      });
  }, [checkoutState, sessionId, user, courseId, router]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/services/${courseId}`)}`);
      return;
    }

    setEnrolling(true);
    try {
      const { url } = await apiPost("/api/checkout", { serviceId: courseId });
      if (!url) throw new ApiError(500, "Could not start checkout.");
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start checkout.");
      setEnrolling(false);
    }
  };

  if (isOwner) {
    return <div className="tm-chip mb-2">This is your course</div>;
  }

  if (hasAccess) {
    return (
      <Button className="btn-tm-outline w-100 mb-2" disabled>
        <BsCheckCircleFill className="me-2" /> Enrolled
      </Button>
    );
  }

  return (
    <Button
      className="btn-tm-primary w-100 mb-2 border-0"
      onClick={handleEnroll}
      disabled={enrolling}
    >
      {enrolling
        ? "Redirecting to checkout…"
        : user
          ? `Enroll & Pay ৳${cost}`
          : "Login to Enroll"}
    </Button>
  );
}
