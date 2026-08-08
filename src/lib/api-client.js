"use client";

/**
 * Thin fetch wrapper for the browser.
 *
 * Everything is same-origin now that the API lives inside this Next.js app, so
 * the session cookie rides along automatically and there is no CORS to
 * configure, no second hostname that has to be reachable, and no API base URL
 * to get wrong per environment.
 */

export class ApiError extends Error {
  constructor(status, message, body = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

export async function apiFetch(path, init = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(path, {
      ...rest,
      signal: controller.signal,
      // Explicit rather than implicit: these requests are authenticated by the
      // session cookie and must never be served from a cache.
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...rest.headers,
      },
    });
  } catch (err) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      throw new ApiError(0, "The server took too long to respond. Please try again.");
    }
    throw new ApiError(0, "Could not reach the server. Check your connection.");
  }
  clearTimeout(timer);

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const record = body ?? {};
    const message =
      typeof record.message === "string"
        ? record.message
        : `Request failed (${response.status}).`;
    throw new ApiError(response.status, message, record);
  }

  return body;
}

export const apiPost = (path, data) =>
  apiFetch(path, { method: "POST", body: JSON.stringify(data ?? {}) });

export const apiPatch = (path, data) =>
  apiFetch(path, { method: "PATCH", body: JSON.stringify(data) });

export const apiDelete = (path) => apiFetch(path, { method: "DELETE" });
