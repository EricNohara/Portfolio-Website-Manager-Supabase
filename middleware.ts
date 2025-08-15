import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Only run session/auth update for dynamic or protected routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Exclude Next.js internals, favicon, images, and the site manifest
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
