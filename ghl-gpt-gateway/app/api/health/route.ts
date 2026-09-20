import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ghl-gpt-gateway",
    configured: {
      ghlToken: Boolean(process.env.GHL_PRIVATE_INTEGRATION_TOKEN),
      gatewayKey: Boolean(process.env.GATEWAY_API_KEY),
      companyId: Boolean(process.env.GHL_COMPANY_ID),
    },
  });
}
