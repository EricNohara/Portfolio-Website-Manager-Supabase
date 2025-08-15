import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PUBLIC_PATHS = [
  "/favicon.ico",
  "/site.webmanifest",
  "/manifest.json",
  "/robots.txt",
  "/api/auth/authenticated",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for public paths or static files
  if (
    PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath)) ||
    path.startsWith("/_next/") ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Only run session update/auth for protected routes
  return await updateSession(request);
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)", // keep matcher broad
};
