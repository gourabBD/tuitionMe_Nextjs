import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Liveness + database readiness. Used by the Docker/Fly health check and handy
 * for confirming a deployment is actually up when the network in front of it
 * is behaving oddly.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: Date.now() - startedAt,
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", database: "unreachable" },
      { status: 503 }
    );
  }
}
