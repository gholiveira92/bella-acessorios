import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("next-auth.session-token");
  
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isMyOrdersRoute = request.nextUrl.pathname.startsWith("/my-orders");
  
  if (isAdminRoute || isMyOrdersRoute) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/my-orders/:path*",
  ],
};