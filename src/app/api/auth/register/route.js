import { assertSameOrigin, fail, handler, ok, rateLimited, readJson } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { createCredentialsUser } from "@/lib/users";
import { firstIssue, registerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Creates an email/password account.
 *
 * Sign-in itself is handled by Auth.js; this endpoint only exists because the
 * Credentials provider has no notion of registration. After a 201 the client
 * calls `signIn("credentials", …)` with the same details.
 */
export const POST = handler(async (req) => {
  assertSameOrigin(req);

  // Registration is the cheapest endpoint to abuse — it writes a row and burns
  // a bcrypt hash per call — so it is throttled by IP rather than by session.
  const limit = await rateLimit("auth:register", clientIp(req), 10, 60 * 60 * 1000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, firstIssue(parsed.error));

  const { name, email, password, image } = parsed.data;
  const result = await createCredentialsUser({ name, email, password, image });

  if (!result.created) {
    // Same status and wording whether or not the address is already taken:
    // this endpoint must not become a way to test which emails have accounts.
    return fail(409, "That account could not be created. Try signing in instead.");
  }

  return ok({ created: true }, { status: 201 });
});
