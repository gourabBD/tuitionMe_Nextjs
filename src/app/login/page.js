import { Suspense } from "react";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";
import { googleConfigured } from "@/auth";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Log in",
  // A sign-in screen has no business in search results.
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Already authenticated visitors never see the form at all.
  if (await getSession()) redirect("/");

  return (
    <Suspense fallback={null}>
      <LoginForm googleEnabled={googleConfigured} />
    </Suspense>
  );
}
