import "server-only";
import { auth } from "@/auth";

/**
 * The app's view of "who is making this request".
 *
 * Everything server-side — pages, route handlers, ownership checks — goes
 * through here rather than reading the Auth.js session directly, so there is
 * exactly one place that decides what an identity looks like and the email is
 * always normalised the same way it is stored.
 *
 * @returns {Promise<import('./types').SessionUser|null>}
 */
export async function getSession() {
  let session;
  try {
    session = await auth();
  } catch {
    // A malformed or undecryptable session cookie is "signed out", not a 500.
    return null;
  }

  const user = session?.user;
  if (!user?.email) return null;

  const email = user.email.toLowerCase();

  return {
    uid: user.id ?? email,
    email,
    name: user.name?.trim() || email.split("@")[0],
    picture: user.image ?? null,
  };
}
