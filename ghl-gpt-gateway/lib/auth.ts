import { timingSafeEqual } from "crypto";

export function isAuthorized(request: Request): boolean {
  const expected = process.env.GATEWAY_API_KEY ?? "";
  const provided = request.headers.get("x-gateway-key") ?? "";

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  if (!expected || a.length !== b.length) {
    console.warn("Gateway auth rejected", {
      method: request.method,
      pathname: new URL(request.url).pathname,
      headerPresent: provided.length > 0,
      providedLength: a.length,
      expectedLength: b.length,
    });
    return false;
  }

  const authorized = timingSafeEqual(a, b);

  if (!authorized) {
    console.warn("Gateway auth rejected", {
      method: request.method,
      pathname: new URL(request.url).pathname,
      headerPresent: true,
      providedLength: a.length,
      expectedLength: b.length,
    });
  }

  return authorized;
}
