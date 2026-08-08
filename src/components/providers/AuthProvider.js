"use client";

import { useCallback, useMemo } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";

/**
 * Auth.js owns the session; this is a thin wrapper so components can keep
 * asking for `useAuth()` and get the app's own user shape rather than the
 * raw provider one.
 *
 * `session` is resolved on the server in the root layout and handed down, so
 * the first paint already knows who is signed in — no logged-out flash in the
 * navbar and no client fetch just to find out.
 */
export default function AuthProvider({ children, session }) {
  return (
    <SessionProvider
      session={session}
      // The JWT already carries its own expiry and Auth.js refreshes on focus;
      // polling would just add background requests for no benefit.
      refetchInterval={0}
      refetchOnWindowFocus
    >
      {children}
    </SessionProvider>
  );
}

export function useAuth() {
  const { data, status } = useSession();

  const user = useMemo(() => {
    const raw = data?.user;
    if (!raw?.email) return null;
    const email = raw.email.toLowerCase();
    return {
      uid: raw.id ?? email,
      email,
      name: raw.name?.trim() || email.split("@")[0],
      picture: raw.image ?? null,
    };
  }, [data]);

  const logout = useCallback(
    () => signOut({ redirect: false }),
    []
  );

  return {
    user,
    loading: status === "loading",
    logout,
  };
}
