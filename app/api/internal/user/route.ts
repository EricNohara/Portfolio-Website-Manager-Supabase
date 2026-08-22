import { NextRequest, NextResponse } from "next/server";

import IUser from "@/app/interfaces/IUser";
import { deleteAccount } from "@/utils/accountDeletion/service";
import { getAuthenticatedUser } from "@/utils/auth/getAuthenticatedUser";
import { refreshCachedUserInfo } from "@/utils/cachedUserInfo/refreshCachedUserInfo";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const { user, supabase, response } = await getAuthenticatedUser();
    if (!user) return response;

    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single<IUser>();

    if (error) {
      throw error;
    } else if (!data) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ userData: data }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, supabase, response } = await getAuthenticatedUser();
    if (!user) return response;

    const userData: IUser = await req.json();

    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", user?.id);

    if (error) throw error;

    // update the user info cache
    await refreshCachedUserInfo(supabase, user.id);

    return NextResponse.json(
      { message: "User successfully created" },
      { status: 201 }
    );
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, supabase, response } = await getAuthenticatedUser();
    if (!user) return response;

    const userData: IUser = await req.json();

    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", user?.id);

    if (error) throw error;

    // update the user info cache
    await refreshCachedUserInfo(supabase, user.id);

    return NextResponse.json({ message: "Update successful" }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

const DELETE_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

function isSameOriginRequest(req: NextRequest) {
  const origin = req.headers.get("origin");
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const expectedHost = forwardedHost || req.headers.get("host");
  if (!origin || !expectedHost) return false;

  try {
    return new URL(origin).host === expectedHost;
  } catch {
    return false;
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { user, supabase, response } = await getAuthenticatedUser({
    allowPendingDeletion: true,
  });
  if (!user) return response;

  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid confirmation" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Invalid confirmation" }, { status: 400 });
    }

    const confirmation = body as Record<string, unknown>;
    const submittedEmail = confirmation.email;
    const phrase = confirmation.phrase;
    const acknowledged = confirmation.acknowledged;
    const emailMatches =
      typeof submittedEmail === "string" &&
      typeof user.email === "string" &&
      submittedEmail.trim().toLowerCase() === user.email.trim().toLowerCase();

    if (
      !emailMatches ||
      phrase !== DELETE_CONFIRMATION_PHRASE ||
      acknowledged !== true
    ) {
      return NextResponse.json({ message: "Invalid confirmation" }, { status: 400 });
    }

    await deleteAccount(user.id, supabase);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Account deletion failed for user ${user.id}:`, error);
    return NextResponse.json(
      { message: "Your account could not be deleted at this time. Please try again later." },
      { status: 500 }
    );
  }
}
