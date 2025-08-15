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
  let path = request.nextUrl.pathname;
  path = path.replace(/\/$/, ""); // Remove trailing slash

  console.log(path);

  if (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith("/_next/") ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)", // keep matcher broad
};
