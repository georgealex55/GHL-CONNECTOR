import { getHighLevelClient } from "@/lib/ghl-client";
import { getCompanyIdInfo } from "@/lib/identity";

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

export type SdkReadResult = {
  status: 200;
  ok: true;
  risk: "read";
  data: unknown;
};

/**
 * Executes the read-only actions that have been migrated to the official
 * HighLevel SDK. Returning undefined tells the caller to use the legacy REST
 * fallback for actions that have not been migrated yet.
 */
export async function executeSdkReadAction(
  action: string,
  p: Payload,
): Promise<SdkReadResult | undefined> {
  const ghl = getHighLevelClient();

  switch (action) {
    case "list_locations": {
      const { companyId } = getCompanyIdInfo();
      const data = await ghl.locations.searchLocations({
        companyId: companyId || undefined,
        limit: optString(p.limit ?? 100),
        skip: optString(p.skip),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_social_accounts": {
      const data = await ghl.socialMediaPosting.getAccount({
        locationId: reqString(p, "locationId"),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_social_posts": {
      const body =
        p.body && typeof p.body === "object"
          ? p.body
          : { type: "all", skip: "0", limit: "20" };

      const data = await ghl.socialMediaPosting.getPosts(
        { locationId: reqString(p, "locationId") },
        body as any,
      );
      return { status: 200, ok: true, risk: "read", data };
    }

    case "get_social_post": {
      const data = await ghl.socialMediaPosting.getPost({
        locationId: reqString(p, "locationId"),
        id: reqString(p, "id"),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_blogs": {
      const data = await ghl.blogs.getBlogs({
        locationId: reqString(p, "locationId"),
        skip: optNumber(p.skip, 0),
        limit: optNumber(p.limit, 50),
        searchTerm: optString(p.searchTerm),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_blog_posts": {
      const data = await ghl.blogs.getBlogPost({
        locationId: reqString(p, "locationId"),
        blogId: reqString(p, "blogId"),
        limit: optNumber(p.limit, 50),
        offset: optNumber(p.offset, 0),
        searchTerm: optString(p.searchTerm),
        status: optString(p.status ?? "ALL"),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_workflows": {
      const data = await ghl.workflows.getWorkflow({
        locationId: reqString(p, "locationId"),
      });
      return { status: 200, ok: true, risk: "read", data };
    }

    case "list_funnels": {
      const data = await ghl.funnels.getFunnels({
        locationId: reqString(p, "locationId"),
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
      const data = await ghl.funnels.getPagesByFunnelId({
        locationId: reqString(p, "locationId"),
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
