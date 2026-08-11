import { NextRequest, NextResponse } from "next/server";

import {
  getCreditBalance,
  getCreditHistory,
} from "@/utils/aiCredits/service";
import { getAuthenticatedUser } from "@/utils/auth/getAuthenticatedUser";

export async function GET(req: NextRequest) {
  const { user, response } = await getAuthenticatedUser();
  if (!user) return response;

  try {
    const requestedLimit = Number(new URL(req.url).searchParams.get("limit") ?? 25);
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 25;
    const [balance, history] = await Promise.all([
      getCreditBalance(user.id),
      getCreditHistory(user.id, limit),
    ]);

    return NextResponse.json({ balance, history }, { status: 200 });
  } catch (error) {
    console.error("AI credit route error:", error);
    return NextResponse.json(
      { error: "Unable to load AI credit information" },
      { status: 500 },
    );
  }
}

