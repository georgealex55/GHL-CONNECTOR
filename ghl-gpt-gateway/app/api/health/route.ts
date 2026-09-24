import { NextResponse } from "next/server";
import { getCompanyIdInfo } from "@/lib/identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const identity = getCompanyIdInfo();
  return NextResponse.json({
    ok: true,
    service: "ghl-gpt-gateway",
    version: "2.1.0",
    sdk: {
      installed: true,
      package: "@gohighlevel/api-client",
      mode: process.env.GHL_PRIVATE_INTEGRATION_TOKEN ? "private-integration" : "unconfigured",
    },
    companyIdConfigured: Boolean(identity.companyId),
    companyIdSource: identity.source,
  });
}
