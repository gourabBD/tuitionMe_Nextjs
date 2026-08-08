import { Suspense } from "react";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/auth/RegisterForm";
import { googleConfigured } from "@/auth";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  if (await getSession()) redirect("/");

  return (
    <Suspense fallback={null}>
      <RegisterForm googleEnabled={googleConfigured} />
    </Suspense>
  );
}
