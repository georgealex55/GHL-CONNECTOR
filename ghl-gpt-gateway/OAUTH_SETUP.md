# HighLevel Agency OAuth Bootstrap

The gateway keeps the existing Agency Private Integration Token (PIT) for normal server-to-server calls.

Agency OAuth is added primarily to obtain HighLevel's authoritative `companyId` and to provide a path to a full OAuth migration later.

## Why hybrid first

HighLevel's Agency OAuth token response contains `companyId` directly. Private Integration Tokens are static/fixed OAuth-like tokens, but their token payload should not be treated as a guaranteed source for Company ID.

This bootstrap flow exchanges the OAuth authorization code, extracts only `companyId`, and intentionally does not return or persist the OAuth access/refresh tokens.

## Create the HighLevel Marketplace app

In the HighLevel Marketplace Developer Portal:

1. Create an app.
2. Use **Private** while building/testing.
3. Set **Target User = Agency**. This cannot be changed after app creation.
4. Use **Agency Only** for installation visibility for this internal agency-control app.
5. In Advanced Settings -> Auth, add the scopes you need.
6. Add this exact Redirect URL:

```
https://ghl-gpt-gateway.vercel.app/api/oauth/callback
```

7. Create a Client Key and copy both values:
   - Client ID
   - Client Secret
8. Copy the Installation URL shown by HighLevel.

## Vercel environment variables

Add:

```
GHL_OAUTH_CLIENT_ID=<HighLevel Marketplace Client ID>
GHL_OAUTH_CLIENT_SECRET=<HighLevel Marketplace Client Secret>
GHL_OAUTH_REDIRECT_URI=https://ghl-gpt-gateway.vercel.app/api/oauth/callback
```

Keep:

```
GHL_PRIVATE_INTEGRATION_TOKEN=<Agency PIT>
GATEWAY_API_KEY=<your gateway secret>
GHL_API_BASE=https://services.leadconnectorhq.com
ALLOW_DESTRUCTIVE_ACTIONS=false
```

You may leave `GHL_COMPANY_ID` absent until OAuth returns it.

## Run the bootstrap

1. Redeploy after adding the OAuth variables.
2. Open:
   `https://ghl-gpt-gateway.vercel.app/api/oauth/status`
3. Confirm `oauthConfigured: true`.
4. Open the Installation URL from the HighLevel Marketplace app.
5. Install it to your Agency.
6. HighLevel redirects to `/api/oauth/callback?code=...`.
7. The callback exchanges the code and returns a JSON response containing:
   `companyId`.
8. Copy only that Company ID into Vercel as:
   `GHL_COMPANY_ID`
9. Redeploy.

## Full OAuth migration later

A full OAuth-only gateway should persist and encrypt the refresh token in a durable database and automatically refresh the one-day access token. Until that storage layer is added, PIT remains the more reliable server credential for this internal gateway.
