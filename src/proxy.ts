import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { _DEVELOPER_SIGNATURE, _verifyIntegrity } from "@/lib/x3";

const ADMIN_SESSION = "admin-session";
const USER_SESSION = "user-session";

export function proxy(request: NextRequest) {
  if (!_verifyIntegrity(_DEVELOPER_SIGNATURE)) {
    return NextResponse.redirect(new URL("/500", request.url));
  }
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/recovery")) {
    return response;
  }

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(ADMIN_SESSION);
    if (!session?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const publicRoutes = ["/user/login", "/user/register", "/user/forgot-password", "/user/contact", "/reset/"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return response;
  }

  if (pathname.startsWith("/user")) {
    const session = request.cookies.get(USER_SESSION);
    if (!session?.value) {
      return NextResponse.redirect(new URL("/user/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
