/**
 * Shown while a server-rendered route is fetching. Uses the same brand tokens
 * as the rest of the app so it doesn't flash a stock white screen.
 */
export default function Loading() {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "60vh" }}
      role="status"
      aria-live="polite"
    >
      <div className="spinner-grow" style={{ color: "var(--color-primary)" }} />
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}
