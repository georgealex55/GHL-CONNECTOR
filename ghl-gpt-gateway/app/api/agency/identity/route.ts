import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { getCompanyIdInfo } from "@/lib/identity";
import { ghlRequest } from "@/lib/ghl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = getCompanyIdInfo();

  if (!info.companyId) {
    return NextResponse.json(
      {
        ok: false,
        companyId: null,
        source: info.source,
        error: "Company ID could not be discovered from the environment or token.",
      },
      { status: 400 },
    );
  }

  const company = await ghlRequest({
    method: "GET",
    path: `/companies/${info.companyId}`,
  });

  return NextResponse.json(
    {
      ok: company.ok,
      companyId: info.companyId,
      source: info.source,
      company: company.data,
    },
    { status: company.ok ? 200 : company.status },
  );
}
