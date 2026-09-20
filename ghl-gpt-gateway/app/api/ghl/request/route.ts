import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { ghlRequest } from "@/lib/ghl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const method = String(payload?.method || "GET").toUpperCase();
    const path = String(payload?.path || "");
    const body = payload?.body;
    const confirmDestructive = payload?.confirmDestructive === true;

    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const result = await ghlRequest({ method, path, body, confirmDestructive });
    return NextResponse.json(result, { status: result.ok ? 200 : result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
