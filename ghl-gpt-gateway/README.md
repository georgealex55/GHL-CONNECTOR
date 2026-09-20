# GHL GPT Agency Control Gateway v2

A secure Vercel/Next.js control layer between GPT and HighLevel.

## Environment variables

- `GHL_PRIVATE_INTEGRATION_TOKEN` — full HighLevel Private Integration token
- `GATEWAY_API_KEY` — separate secret used by GPT to call this gateway
- `GHL_COMPANY_ID` — agency/company ID (recommended for agency location search)
- `GHL_API_BASE` — defaults to `https://services.leadconnectorhq.com`
- `ALLOW_DESTRUCTIVE_ACTIONS` — defaults to false; set true only if you want deletes/removals enabled

## Main endpoints

- `GET /api/health`
- `GET /api/openapi.json` — GPT Actions/OpenAPI schema
- `POST /api/agency/action` — semantic action router
- `POST /api/ghl/request` — advanced allowlisted proxy

All non-health calls require `x-gateway-key`.

## Native action coverage

### Social Planner
List connected accounts/posts, get a post, create/schedule/draft/publish posts, edit posts and optionally delete posts.

### Blogs
List blogs/posts, retrieve a published post body, create and update posts.

### Workflows
List workflow definitions. The gateway can also add/remove contacts from known workflows through the Contact API. HighLevel's public workflow endpoint is currently read-only for the workflow definition itself.

### Funnels / websites
List funnels and pages and manage redirects. Full visual website/funnel page editing is not exposed through the current public API; use browser automation for those UI-only changes.

### Existing CRM
Contacts, opportunities/pipelines and conversations/messages remain available through the advanced allowlisted proxy.

## Safety model

The HighLevel token is never returned to the client. Routes are explicitly allowlisted. Delete/remove actions are blocked unless `ALLOW_DESTRUCTIVE_ACTIONS=true` AND the request includes `confirmDestructive=true`.

See `PERMISSIONS.md` for the scope checklist.
