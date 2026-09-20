type JsonRecord = Record<string, unknown>;

let cachedCompanyId: string | null | undefined;

function decodeJwtPayload(token: string): JsonRecord | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as JsonRecord
      : null;
  } catch {
    return null;
  }
}

function findCompanyId(value: unknown, depth = 0): string | null {
  if (depth > 5 || !value || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findCompanyId(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const obj = value as JsonRecord;
  const directKeys = ["companyId", "company_id", "agencyId", "agency_id"];

  for (const key of directKeys) {
    const candidate = obj[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  for (const nested of Object.values(obj)) {
    const found = findCompanyId(nested, depth + 1);
    if (found) return found;
  }

  return null;
}

export function getCompanyIdInfo(): {
  companyId: string | null;
  source: "env" | "token" | "unavailable";
} {
  const configured = process.env.GHL_COMPANY_ID?.trim();
  if (configured) return { companyId: configured, source: "env" };

  if (cachedCompanyId !== undefined) {
    return {
      companyId: cachedCompanyId,
      source: cachedCompanyId ? "token" : "unavailable",
    };
  }

  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim();
  if (!token) {
    cachedCompanyId = null;
    return { companyId: null, source: "unavailable" };
  }

  const payload = decodeJwtPayload(token);
  cachedCompanyId = payload ? findCompanyId(payload) : null;

  return {
    companyId: cachedCompanyId,
    source: cachedCompanyId ? "token" : "unavailable",
  };
}
