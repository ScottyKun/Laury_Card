import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/create", "/dashboard", "/books", "/profile", "/inbox"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create/:path*", "/dashboard/:path*", "/books/:path*"],
};