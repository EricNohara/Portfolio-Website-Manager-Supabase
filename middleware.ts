import { type NextRequest } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // update user's auth session
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
