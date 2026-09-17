import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getServerUser } from "@/lib/auth";

const STATE_COOKIE = "google_link_state";

export async function GET() {
  const user = await getServerUser();
  if (!user?.id) {
    return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google-link/callback`;

  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID as string);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
