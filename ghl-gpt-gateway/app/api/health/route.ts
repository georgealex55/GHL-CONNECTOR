import { NextResponse } from "next/server";
import { getCompanyIdInfo } from "@/lib/identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const company = getCompanyIdInfo();
  return NextResponse.json({
    ok: true,
    service: "ghl-gpt-gateway",
    configured: {
      ghlToken: Boolean(process.env.GHL_PRIVATE_INTEGRATION_TOKEN),
      gatewayKey: Boolean(process.env.GATEWAY_API_KEY),
      companyId: Boolean(company.companyId),
      companyIdSource: company.source,
    },
  });
}
