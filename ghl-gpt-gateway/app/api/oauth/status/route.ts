import { NextResponse } from "next/server";
import {
  getAgencyOAuthSession,
  isLocationOAuthConfigured,
} from "@/lib/ghl-oauth";
import { isDurableOAuthStorageConfigured } from "@/lib/ghl-session-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const redirectUri =
    process.env.GHL_OAUTH_REDIRECT_URI?.trim() ||
    `${origin}/api/oauth/callback`;

  const oauthConfigured = Boolean(
    process.env.GHL_OAUTH_CLIENT_ID &&
      process.env.GHL_OAUTH_CLIENT_SECRET,
  );
  const durableStorageConfigured = isDurableOAuthStorageConfigured();

  let agencySessionStored = false;
  if (oauthConfigured && durableStorageConfigured) {
    try {
      agencySessionStored = Boolean(
        (await getAgencyOAuthSession())?.access_token,
      );
    } catch {
      agencySessionStored = false;
    }
  }

  return NextResponse.json({
    ok: true,
    oauthConfigured,
    durableStorageConfigured,
    locationOAuthReady:
      isLocationOAuthConfigured() && agencySessionStored,
    agencySessionStored,
    redirectUri,
    clientIdConfigured: Boolean(process.env.GHL_OAUTH_CLIENT_ID),
    clientSecretConfigured: Boolean(process.env.GHL_OAUTH_CLIENT_SECRET),
    tokenEncryptionConfigured: Boolean(
      process.env.GHL_TOKEN_ENCRYPTION_KEY,
    ),
    oauthDatabaseConfigured: Boolean(
      process.env.GHL_OAUTH_DATABASE_URL || process.env.DATABASE_URL,
    ),
  });
}
