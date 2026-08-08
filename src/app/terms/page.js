import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Tuition Me.",
};

export default function TermsPage() {
  return (
    <div className="tm-page tm-section">
      <div className="tm-container" style={{ maxWidth: 760 }}>
        <span className="tm-eyebrow">Legal</span>
        <h2 className="tm-section-title">Terms &amp; Conditions</h2>
        <p className="tm-text-muted">
          Note that you&apos;ll sometimes see this agreement referred to as a Terms of
          Use, User Agreement or Terms of Service agreement. These terms are
          interchangeable and refer to the same type of agreement.
        </p>
        <p className="tm-text-muted">
          The purpose of a Terms and Conditions agreement is to prevent
          misunderstandings between the business owner (us), and the consumer. The
          agreement helps:
        </p>
        <ul className="tm-text-muted">
          <li>Protect intellectual property</li>
          <li>Avoid website abuse</li>
          <li>Define the limits of our legal obligations to the consumer</li>
        </ul>
        <p className="tm-text-muted">
          Essentially, the T&amp;C helps run the business more effectively and with
          greater peace of mind. This agreement forms the basis of an enforceable
          legal relationship. It tells anyone browsing the website, whether a casual
          visitor or an active client, what their legal responsibilities and rights
          are.
        </p>
        <Link
          href="/register"
          className="btn-tm-outline text-decoration-none d-inline-block mt-2"
        >
          Back to registration
        </Link>
      </div>
    </div>
  );
}
