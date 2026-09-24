import { timingSafeEqual } from "crypto";

export function isAuthorized(request: Request): boolean {
  const expected = process.env.GATEWAY_API_KEY;
  if (!expected) return false;

  const provided = request.headers.get("x-gateway-key") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
