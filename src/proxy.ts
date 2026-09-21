import { NextResponse, type NextRequest } from "next/server";

const normalizeHost = (value: string) => value.split(",")[0].trim().toLowerCase().split(":")[0];

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const requestHost = normalizeHost(forwardedHost || request.headers.get("host") || "");
  const configuredHosts = (process.env.ADMIN_ALLOWED_HOSTS || "")
    .split(",")
    .map(normalizeHost)
    .filter(Boolean);
  const localHosts = ["localhost", "127.0.0.1"];
  const allowedHosts = configuredHosts.length > 0 ? [...configuredHosts, ...localHosts] : localHosts;

  if (!allowedHosts.includes(requestHost)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
