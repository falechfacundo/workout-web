import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";

const STATE_COOKIE = "google_link_state";

function settingsUrl(param: string) {
  return new URL(`/dashboard/settings?${param}`, process.env.NEXT_PUBLIC_APP_URL);
}

function decodeIdToken(idToken: string): { sub: string; email: string; email_verified?: boolean } {
  const payload = idToken.split(".")[1];
  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json);
}

export async function GET(request: NextRequest) {
  const user = await getServerUser();
  if (!user?.id) {
    return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(settingsUrl("linkError=invalid_state"));
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google-link/callback`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(settingsUrl("linkError=token_exchange_failed"));
  }

  const tokens = await tokenResponse.json();
  const claims = decodeIdToken(tokens.id_token);

  if (!claims.email_verified || claims.email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.redirect(settingsUrl("linkError=email_mismatch"));
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: { google_id: claims.sub },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.redirect(settingsUrl("linkError=already_linked_elsewhere"));
    }
    return NextResponse.redirect(settingsUrl("linkError=unknown"));
  }

  const response = NextResponse.redirect(settingsUrl("linked=1"));
  response.cookies.delete(STATE_COOKIE);
  return response;
}
