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
import { ApiError, apiPost } from "@/lib/api-client";
import { safeRedirect } from "@/lib/safe-redirect";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export default function RegisterForm({ googleEnabled }) {
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination = safeRedirect(searchParams.get("next"));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = (name) => form.elements.namedItem(name).value.trim();

    const name = value("name");
    const image = value("photo");
    const email = value("email");
    const password = form.elements.namedItem("password").value;

    // Mirrors the server-side schema so an obvious mistake is caught without a
    // round trip. The server still validates everything again.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      setError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (image && !/^https?:\/\//i.test(image)) {
      setError("Photo URL must start with http:// or https://");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await apiPost("/api/auth/register", { name, email, password, image });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create your account."
      );
      setBusy(false);
      return;
    }

    // Registration succeeded — sign straight in with the same credentials.
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError(friendlyAuthError(result.error));
      setBusy(false);
      return;
    }

    toast.success("Account created! Welcome to Tuition Me.");
    router.replace(destination);
    router.refresh();
  };

  return (
    <div className="tm-auth-wrap">
      <div className="tm-auth-card">
        <h3 className="mb-1">Create your account</h3>
        <p className="tm-text-muted mb-4">Start learning in minutes.</p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="register-name">
            <Form.Label>Full name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              placeholder="Jane Doe"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="register-photo">
            <Form.Label>
              Photo URL <span className="tm-text-muted">(optional)</span>
            </Form.Label>
            <Form.Control name="photo" type="url" placeholder="https://..." />
          </Form.Group>

          <Form.Group className="mb-3" controlId="register-email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="register-password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="register-terms">
            <Form.Check
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              label={
                <span style={{ fontSize: "0.9rem" }}>
                  I accept the <Link href="/terms">Terms &amp; Conditions</Link>
                </span>
              }
            />
          </Form.Group>

          <Button
            className="btn-tm-primary w-100 border-0"
            type="submit"
            disabled={!accepted || busy}
          >
            {busy ? "Creating account…" : "Create account"}
          </Button>

          {error && (
            <Form.Text className="text-danger d-block mt-2" role="alert">
              {error}
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
              className="btn-tm-outline w-100"
              disabled={busy}
              onClick={() => signIn("google", { callbackUrl: destination })}
            >
              <BsGoogle className="me-2" /> Sign up with Google
            </Button>
          </>
        )}

        <p className="text-center mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
