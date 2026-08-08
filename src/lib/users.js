import "server-only";
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";

/**
 * The `users` collection is shared with the Auth.js MongoDB adapter, which
 * creates a document for anyone who signs in with Google. Credentials accounts
 * live in the same collection and simply carry an extra `passwordHash`.
 */
export async function users() {
  return (await getDb()).collection("users");
}

/** bcrypt work factor. 12 is ~250ms on current hardware — deliberately slow. */
const BCRYPT_ROUNDS = 12;

/**
 * A pre-computed hash of a throwaway value.
 *
 * When an email doesn't exist we still run a bcrypt comparison against this,
 * so a login attempt costs the same whether or not the account is real. Skipping
 * it would turn response time into a user-enumeration oracle.
 */
const DUMMY_HASH = bcrypt.hashSync("tuition-me-dummy-password", BCRYPT_ROUNDS);

export const normaliseEmail = (email) => String(email || "").trim().toLowerCase();

export async function findUserByEmail(email) {
  const col = await users();
  return col.findOne({ email: normaliseEmail(email) });
}

/**
 * Creates a credentials account.
 *
 * Returns `{ created: false, reason }` rather than throwing so the caller can
 * decide how much to reveal — the register endpoint deliberately returns the
 * same message whether the address is taken or not.
 */
export async function createCredentialsUser({ name, email, password, image }) {
  const col = await users();
  const normalised = normaliseEmail(email);

  const existing = await col.findOne({ email: normalised });
  if (existing) return { created: false, reason: "exists" };

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const result = await col.insertOne({
      name,
      email: normalised,
      image: image || null,
      emailVerified: null,
      passwordHash,
      createdAt: new Date(),
    });
    return { created: true, id: result.insertedId.toString() };
  } catch (err) {
    // Unique index on email lost a race with a concurrent signup.
    if (err?.code === 11000) return { created: false, reason: "exists" };
    throw err;
  }
}

/**
 * Verifies an email/password pair.
 *
 * Always returns null on failure — never a reason. The caller cannot tell
 * "no such user" from "wrong password", and neither can an attacker.
 */
export async function verifyCredentials(email, password) {
  const user = await findUserByEmail(email);

  if (!user?.passwordHash) {
    // Burn the same time as a real comparison. Covers both "no account" and
    // "account exists but signed up with Google, so it has no password".
    await bcrypt.compare(password, DUMMY_HASH);
    return null;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return null;

  return {
    id: user._id.toString(),
    name: user.name || user.email.split("@")[0],
    email: user.email,
    image: user.image || null,
  };
}
