import { getHighLevelClient } from "@/lib/ghl-client";
import {
  ensureLocationOAuthSession,
  getOAuthHighLevelClient,
} from "@/lib/ghl-oauth";

type Payload = Record<string, unknown>;

function reqString(p: Payload, key: string): string {
  const value = p[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function optString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function optNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function locationIdFromPayload(p: Payload): string {
  if (typeof p.locationId === "string" && p.locationId.trim()) {
    return p.locationId.trim();
  }

  const body = p.body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const value = (body as Record<string, unknown>).locationId;
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  throw new Error(
    "locationId is required for location-scoped OAuth actions",
  );
}

async function getLocationClient(
  p: Payload,
): Promise<{
  ghl: ReturnType<typeof getOAuthHighLevelClient>;
  locationId: string;
}> {
  const locationId = locationIdFromPayload(p);
  await ensureLocationOAuthSession(locationId);
  return {
    ghl: getOAuthHighLevelClient(),
    locationId,
  };
}

export type SdkReadResult = {
  status: 200;
  ok: true;
  risk: "read";
  data: unknown;
};

/**
 * Executes read actions through the official SDK.
 *
 * Agency discovery continues to use the Agency Private Integration token.
 * Location-scoped actions use durable OAuth sessions. The first request for a
 * location mints a Location token from the stored Agency OAuth session.
 */
export async function executeSdkReadAction(
  action: string,
  p: Payload,
): Promise<SdkReadResult | undefined> {
  switch (action) {
    case "list_locations": {
      const ghl = getHighLevelClient();
      const data = await ghl.locations.searchLocations({
        companyId:
          process.env.GHL_COMPANY_ID?.trim() || undefined,
        limit: optString(p.limit ?? 100),
        skip: optString(p.skip),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_social_accounts": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.socialMediaPosting.getAccount({
        locationId,
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_social_posts": {
      const { ghl, locationId } = await getLocationClient(p);
      const body =
        p.body && typeof p.body === "object"
          ? p.body
          : { type: "all", skip: "0", limit: "20" };

      const data = await ghl.socialMediaPosting.getPosts(
        { locationId },
        body as any,
      );
      return { status: 200, ok: true, risk: "read", data };
    }

    case "get_social_post": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.socialMediaPosting.getPost({
        locationId,
        id: reqString(p, "id"),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_blogs": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.blogs.getBlogs({
        locationId,
        skip: optNumber(p.skip, 0),
        limit: optNumber(p.limit, 50),
        searchTerm: optString(p.searchTerm),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_blog_posts": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.blogs.getBlogPost({
        locationId,
        blogId: reqString(p, "blogId"),
        limit: optNumber(p.limit, 50),
        offset: optNumber(p.offset, 0),
        searchTerm: optString(p.searchTerm),
        status: optString(p.status ?? "ALL"),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_workflows": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.workflows.getWorkflow({
        locationId,
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_funnels": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.funnels.getFunnels({
        locationId,
        type: optString(p.type),
        category: optString(p.category),
        offset: optString(p.offset ?? 0),
        limit: optString(p.limit ?? 50),
        parentId: optString(p.parentId),
        name: optString(p.name),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_funnel_pages": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.funnels.getPagesByFunnelId({
        locationId,
        funnelId: reqString(p, "funnelId"),
        name: optString(p.name),
        limit: optNumber(p.limit, 50),
        offset: optNumber(p.offset, 0),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    default:
      return undefined;
  }
}

function reqBody(p: Payload): Record<string, unknown> {
  const body = p.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("body is required");
  }
  return body as Record<string, unknown>;
}

export type SdkWriteResult = {
  status: 200;
  ok: true;
  risk: "write";
  data: unknown;
};

/**
 * Location-scoped writes use the same durable OAuth session as reads.
 * Destructive operations remain on the legacy guarded transport.
 */
export async function executeSdkWriteAction(
  action: string,
  p: Payload,
): Promise<SdkWriteResult | undefined> {
  switch (action) {
    case "create_social_post": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.socialMediaPosting.createPost(
        { locationId },
        reqBody(p) as any,
      );
      return { status: 200, ok: true, risk: "write", data };
    }

    case "update_social_post": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.socialMediaPosting.editPost(
        {
          locationId,
          id: reqString(p, "id"),
        },
        reqBody(p) as any,
      );
      return { status: 200, ok: true, risk: "write", data };
    }

    case "create_blog_post": {
      const { ghl } = await getLocationClient(p);
      const data = await ghl.blogs.createBlogPost(reqBody(p) as any);
      return { status: 200, ok: true, risk: "write", data };
    }

    case "update_blog_post": {
      const { ghl } = await getLocationClient(p);
      const data = await ghl.blogs.updateBlogPost(
        { postId: reqString(p, "id") },
        reqBody(p) as any,
      );
      return { status: 200, ok: true, risk: "write", data };
    }

    case "add_contact_to_workflow": {
      const { ghl, locationId } = await getLocationClient(p);
      const data = await ghl.contacts.addContactToWorkflow(
        {
          contactId: reqString(p, "contactId"),
          workflowId: reqString(p, "workflowId"),
        },
        (p.body && typeof p.body === "object" ? p.body : {}) as any,
        { headers: { locationId } },
      );
      return { status: 200, ok: true, risk: "write", data };
    }

    case "create_redirect": {
      const { ghl } = await getLocationClient(p);
      const data = await ghl.funnels.createRedirect(reqBody(p) as any);
      return { status: 200, ok: true, risk: "write", data };
    }

    default:
      return undefined;
  }
}
