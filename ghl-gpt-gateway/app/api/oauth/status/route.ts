import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const redirectUri =
    process.env.GHL_OAUTH_REDIRECT_URI?.trim() ||
    `${origin}/api/oauth/callback`;

  return NextResponse.json({
    ok: true,
    oauthConfigured: Boolean(
      process.env.GHL_OAUTH_CLIENT_ID &&
        process.env.GHL_OAUTH_CLIENT_SECRET,
    ),
    redirectUri,
    clientIdConfigured: Boolean(process.env.GHL_OAUTH_CLIENT_ID),
    clientSecretConfigured: Boolean(process.env.GHL_OAUTH_CLIENT_SECRET),
  });
}
