/**
 * Runs once when a server instance boots (Node runtime only). Used to warm the
 * Mongo connection and create indexes off the critical path of the first
 * request rather than inside it.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Imported lazily so the Edge runtime never pulls the driver into its bundle.
  const { ensureIndexes } = await import("./lib/indexes");

  try {
    await ensureIndexes();
  } catch (err) {
    // A boot-time index failure must not stop the app from serving traffic —
    // every query still works without them, just slower.
    console.error("[startup] index creation failed:", err);
  }
}
