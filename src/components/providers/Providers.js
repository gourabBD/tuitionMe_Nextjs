"use client";

import { Toaster } from "react-hot-toast";
import AuthProvider from "./AuthProvider";
import ThemeProvider from "./ThemeProvider";

export default function Providers({ children, session }) {
  return (
    <ThemeProvider>
      <AuthProvider session={session}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
