import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  // Bypass auth/session for static files, icons, and the manifest
  if (
    url.startsWith("/_next/") ||
    url === "/favicon.ico" ||
    url === "/site.webmanifest" ||
    url.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Otherwise, run your session update/auth logic
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static files, favicon, images, and manifest
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
