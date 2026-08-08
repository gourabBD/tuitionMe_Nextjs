/**
 * Normalises a `?next=` value into a safe in-app destination.
 *
 * Anything that isn't a single-slash-prefixed relative path is discarded, which
 * blocks the classic open-redirect shapes (`//evil.com`, `https://evil.com`,
 * and backslash variants some browsers normalise to `//`). Used by the auth
 * screens, which are exactly where an open redirect is most valuable to a
 * phisher.
 */
export function safeRedirect(next, fallback = "/") {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.includes("\\")) return fallback;
  return next;
}
