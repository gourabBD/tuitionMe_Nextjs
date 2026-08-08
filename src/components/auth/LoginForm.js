"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { BsGoogle } from "react-icons/bs";
import toast from "react-hot-toast";

import { friendlyAuthError } from "@/components/auth/authErrors";
import { safeRedirect } from "@/lib/safe-redirect";

export default function LoginForm({ googleEnabled }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth.js redirects its own failures back here with ?error=<code>.
  const initialError = searchParams.get("error");
  const destination = safeRedirect(searchParams.get("next"));

  const handleLogin = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.elements.namedItem("email").value;
    const password = form.elements.namedItem("password").value;

    setBusy(true);
    setError("");

    // `redirect: false` keeps the failure on this page so the error can be
    // rendered inline instead of bouncing through a query string.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(friendlyAuthError(result.error));
      setBusy(false);
      return;
    }

    toast.success("Welcome back!");
    router.replace(destination);
    // Re-render the server components so the navbar and any gated page pick up
    // the new session immediately.
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    setError("");
    // OAuth needs a full redirect to Google, so this one does navigate away.
    await signIn("google", { callbackUrl: destination });
  };

  const shownError = error || (initialError ? friendlyAuthError(initialError) : "");

  return (
    <div className="tm-auth-wrap">
      <div className="tm-auth-card">
        <h3 className="mb-1">Welcome back</h3>
        <p className="tm-text-muted mb-4">Log in to continue learning.</p>

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="login-email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="login-password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              required
            />
          </Form.Group>

          <Button className="btn-tm-primary w-100 border-0" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Log in"}
          </Button>

          {shownError && (
            <Form.Text className="text-danger d-block mt-2" role="alert">
              {shownError}
            </Form.Text>
          )}
        </Form>

        {googleEnabled && (
          <>
            <div className="d-flex align-items-center gap-2 my-3">
              <hr className="tm-divider flex-grow-1" />
              <span className="tm-text-muted" style={{ fontSize: "0.8rem" }}>
                or
              </span>
              <hr className="tm-divider flex-grow-1" />
            </div>

            <Button
              onClick={handleGoogleSignIn}
              className="btn-tm-outline w-100"
              disabled={busy}
            >
              <BsGoogle className="me-2" /> Continue with Google
            </Button>
          </>
        )}

        <p className="text-center mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
          Don&apos;t have an account? <Link href="/register">Register now</Link>
        </p>
      </div>
    </div>
  );
}
