# HighLevel Agency → Location OAuth

The gateway now uses a two-level authentication model:

1. The existing Agency Private Integration Token remains available for agency-level discovery such as listing locations.
2. A HighLevel Marketplace OAuth installation stores the Agency access/refresh token securely.
3. For location-scoped operations, the gateway exchanges the stored Agency token for a Location token using HighLevel's official OAuth endpoint.
4. Location access/refresh tokens are stored durably and refreshed by the official HighLevel SDK.

This avoids creating a separate Private Integration manually inside every sub-account.

## Required environment variables

Keep the existing variables:

```
GHL_PRIVATE_INTEGRATION_TOKEN=<Agency PIT>
GATEWAY_API_KEY=<gateway secret>
GHL_COMPANY_ID=<HighLevel company ID>
GHL_API_BASE=https://services.leadconnectorhq.com
ALLOW_DESTRUCTIVE_ACTIONS=false
```

OAuth credentials:

```
GHL_OAUTH_CLIENT_ID=<Marketplace App Client ID>
GHL_OAUTH_CLIENT_SECRET=<Marketplace App Client Secret>
GHL_OAUTH_REDIRECT_URI=https://agency-control-gateway.vercel.app/api/oauth/callback
```

Durable OAuth storage:

```
GHL_OAUTH_DATABASE_URL=<Neon Postgres connection string>
GHL_TOKEN_ENCRYPTION_KEY=<32-byte encryption key, hex or base64>
```

`DATABASE_URL` may be used instead of `GHL_OAUTH_DATABASE_URL`, but the dedicated variable is preferred so OAuth token storage is clearly separated from other application databases.

## Storage design

OAuth sessions are stored in Postgres table:

```
ghl_oauth_sessions
```

Each token payload is encrypted with AES-256-GCM before it is written to Postgres. The encryption key remains only in the deployment environment.

The table is created automatically when durable OAuth storage is first initialized.

## Marketplace app

Use an Agency-targeted HighLevel Marketplace app.

The OAuth app must request both the agency scopes needed for installation/discovery and the location scopes required by the gateway, including the location-level services you intend to use such as workflows, funnels, blogs, Social Planner, contacts, conversations, calendars, and other enabled modules.

The redirect URL must exactly match:

```
https://agency-control-gateway.vercel.app/api/oauth/callback
```

## Bootstrap sequence

1. Configure all OAuth and durable-storage environment variables in Vercel Preview.
2. Redeploy `ghl-sdk-integration`.
3. Open:

   `/api/oauth/status`

4. Confirm:

```json
{
  "oauthConfigured": true,
  "durableStorageConfigured": true,
  "agencySessionStored": false
}
```

5. Install or reinstall the Marketplace app to the Agency.
6. HighLevel redirects to `/api/oauth/callback?code=...`.
7. The callback exchanges the code and stores the Agency access + refresh tokens encrypted in Postgres. Tokens are never returned to the browser.
8. Check `/api/oauth/status` again. It should report:

```json
{
  "locationOAuthReady": true,
  "agencySessionStored": true
}
```

## Location token generation

Location-scoped SDK actions automatically call the location session manager.

For a new location:

```
Agency OAuth session
        ↓
POST /oauth/locationToken
        ↓
Location access + refresh token
        ↓
Encrypted durable session
        ↓
Official HighLevel SDK request
```

A protected diagnostic endpoint is also available:

```
POST /api/oauth/location-session
{
  "locationId": "<location-id>"
}
```

It reports whether the session already existed or was newly created, but never returns access or refresh tokens.

## Current routing

Agency Private Integration:
- `list_locations`
- other agency-level operations that are supported by the Agency PIT

Durable Location OAuth:
- workflows
- funnels/pages
- blogs
- Social Planner
- migrated location-scoped write actions

Destructive actions remain behind the existing double guard:

```
ALLOW_DESTRUCTIVE_ACTIONS=true
confirmDestructive=true
```

## Production promotion

Do not merge this branch into `main` until:

1. durable OAuth storage is configured,
2. Agency OAuth installation is stored successfully,
3. at least one Location token can be generated,
4. the read validation endpoint passes the location-scoped tests,
5. safe write actions have been tested with disposable data.
