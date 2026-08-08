import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { isProduction } from "./env";

/** Successful JSON response. API responses are never cacheable (see next.config). */
export function ok(data, init) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function fail(status, message, extra) {
  return NextResponse.json({ message, ...extra }, { status });
}

/** Thrown by the helpers below to unwind straight to a response. */
export class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.extra = extra;
  }
}

/**
 * Wraps a route handler so an unexpected throw becomes a 500 with a generic
 * message. Internal error text (Mongo connection strings, stack traces) must
 * never reach the client, so only `HttpError` messages are passed through.
 */
export function handler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        return fail(err.status, err.message, err.extra);
      }
      console.error("[api] unhandled error:", err);
      return fail(500, "Something went wrong on the server.");
    }
  };
}

/**
 * Rejects cross-site writes.
 *
 * The session cookie is `SameSite=Lax`, which already blocks cross-site POSTs
 * from being sent with credentials in current browsers. This is the second
 * layer: any state-changing request must carry an `Origin` matching the host
 * it was delivered to. Requests with no `Origin` at all are rejected too, since
 * every legitimate caller here is a browser fetch.
 */
export function assertSameOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) {
    throw new HttpError(403, "Missing Origin header.");
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) {
    throw new HttpError(403, "Cannot determine request host.");
  }

  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Invalid Origin header.");
  }

  if (originHost !== host) {
    throw new HttpError(403, "Cross-site request rejected.");
  }
}

/** 1 MiB is far more than any request here legitimately needs. */
const MAX_BODY_BYTES = 1024 * 1024;

/**
 * Parses a JSON body, enforcing the content type and a size cap so a huge or
 * mistyped payload can't be used to burn memory on the server.
 */
export async function readJson(req) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "Expected application/json.");
  }

  const declared = req.headers.get("content-length");
  if (declared && Number(declared) > MAX_BODY_BYTES) {
    throw new HttpError(413, "Request body too large.");
  }

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new HttpError(413, "Request body too large.");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}

/** Returns the signed-in user or throws a 401. */
export async function requireUser() {
  const user = await getSession();
  if (!user) {
    throw new HttpError(401, "You must be signed in to do that.");
  }
  return user;
}

/**
 * The standard preamble for any mutating endpoint: reject cross-site callers,
 * then require a session.
 */
export async function requireUserForWrite(req) {
  assertSameOrigin(req);
  return requireUser();
}

export function rateLimited(retryAfterSeconds) {
  return NextResponse.json(
    { message: "Too many requests, please try again in a moment." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

/** Log line that stays useful in production without leaking request bodies. */
export function logEvent(event, details = {}) {
  if (!isProduction) {
    console.log(`[${event}]`, details);
    return;
  }
  console.log(JSON.stringify({ event, ...details, at: new Date().toISOString() }));
}
