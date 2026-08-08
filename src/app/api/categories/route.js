import { handler, ok } from "@/lib/api";
import { listCategories } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async () => ok(await listCategories()));
