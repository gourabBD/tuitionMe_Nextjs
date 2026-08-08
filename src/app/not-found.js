import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div
      className="tm-page d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: "70vh", padding: "40px 16px" }}
    >
      <span className="tm-eyebrow">Error 404</span>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "3rem" }}>
        Page not found
      </h1>
      <p className="tm-text-muted mb-4" style={{ maxWidth: 420 }}>
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link href="/" className="btn-tm-primary text-decoration-none">
        Back to home
      </Link>
    </div>
  );
}
