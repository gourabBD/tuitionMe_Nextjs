import { handlers } from "@/auth";

// Auth.js owns /api/auth/* : sign-in, sign-out, the OAuth callback, CSRF token
// and session endpoints all live behind this one catch-all route.
export const { GET, POST } = handlers;

export const runtime = "nodejs";
