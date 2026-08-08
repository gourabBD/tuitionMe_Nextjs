"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * Next only hands the client a `digest` in production, never the real error
 * text — which is what we want: a database failure must not print its
 * connection details into someone's browser. The digest is enough to find the
 * matching server log line.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div
      className="tm-page d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: "70vh", padding: "40px 16px" }}
    >
      <span className="tm-eyebrow">Connection problem</span>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2.5rem" }}>
        Something went wrong
      </h1>
      <p className="tm-text-muted mb-4" style={{ maxWidth: 460 }}>
        We couldn&apos;t load this page. It may be a temporary problem — try again in
        a moment.
      </p>
      {error?.digest && (
        <p className="tm-text-muted mb-4" style={{ fontSize: "0.8rem" }}>
          Reference: <code>{error.digest}</code>
        </p>
      )}
      <div className="d-flex gap-2">
        <button type="button" className="btn-tm-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn-tm-outline text-decoration-none">
          Back to home
        </Link>
      </div>
    </div>
  );
}
