import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PUBLIC_PATHS = [
  "/favicon.ico",
  "/site.webmanifest",
  "/api/auth/authenticated", // your public auth check endpoint
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for public paths or static files
  if (
    PUBLIC_PATHS.includes(path) ||
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
