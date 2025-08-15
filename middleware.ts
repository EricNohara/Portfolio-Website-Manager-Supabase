import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static files, icons, and the manifest
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/api/auth/") || // skip your auth endpoints if public
    path === "/favicon.ico" ||
    path === "/site.webmanifest" ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Only run session update/auth for protected routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
