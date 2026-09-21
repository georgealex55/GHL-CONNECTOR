import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing OAuth authorization code.",
        expectedCallback: `${url.origin}/api/oauth/callback`,
      },
      { status: 400 },
    );
  }

  const clientId = process.env.GHL_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GHL_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.GHL_OAUTH_REDIRECT_URI?.trim() ||
    `${url.origin}/api/oauth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GHL_OAUTH_CLIENT_ID and GHL_OAUTH_CLIENT_SECRET must be configured in Vercel.",
      },
      { status: 500 },
    );
  }

  const tokenResponse = await fetch(
    "https://services.leadconnectorhq.com/oauth/token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        user_type: "Company",
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
    },
  );

  const raw = await tokenResponse.text();
  let data: Record<string, unknown> = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: tokenResponse.status,
        error: "HighLevel OAuth token exchange failed.",
        details: data,
      },
      { status: tokenResponse.status },
    );
  }

  const companyId =
    typeof data.companyId === "string" ? data.companyId : null;

  return NextResponse.json({
    ok: true,
    companyId,
    userType: data.userType ?? null,
    scope: data.scope ?? null,
    expiresIn: data.expires_in ?? null,
    nextStep: companyId
      ? "Set GHL_COMPANY_ID in Vercel to this companyId, then redeploy. The access and refresh tokens were intentionally not returned or stored."
      : "OAuth succeeded but HighLevel did not return companyId.",
  });
}
