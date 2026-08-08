"use client";

/**
 * Last-resort boundary for errors thrown by the root layout itself. It has to
 * render its own <html>/<body> because the layout that normally provides them
 * is the thing that failed.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: "system-ui, sans-serif",
          background: "#f6f7fb",
          color: "#1c1d1f",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontWeight: 800 }}>Something went wrong</h2>
        <p style={{ maxWidth: 420, color: "#5f6470" }}>
          The application failed to start. Please refresh the page.
        </p>
        {error?.digest && (
          <p style={{ fontSize: "0.8rem", color: "#5f6470" }}>
            Reference: <code>{error.digest}</code>
          </p>
        )}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload page
        </button>
      </body>
    </html>
  );
}
