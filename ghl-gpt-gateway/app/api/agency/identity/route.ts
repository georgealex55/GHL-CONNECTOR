import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { getCompanyIdInfo } from "@/lib/identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = getCompanyIdInfo();

  return NextResponse.json(
    {
      ok: Boolean(info.companyId),
      companyId: info.companyId,
      source: info.source,
      note: info.companyId
        ? "Company ID discovered locally from the configured environment or Private Integration token. Use list_locations to validate agency access against HighLevel."
        : "Company ID could not be discovered from the environment or token.",
    },
    { status: info.companyId ? 200 : 400 },
  );
}
