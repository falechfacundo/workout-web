import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: any) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user must change password, redirect to /change-password
    // (except API auth routes)
    if (
      token?.mustChangePassword &&
      pathname !== "/change-password" &&
      !pathname.startsWith("/api/auth")
    ) {
      return NextResponse.redirect(new URL("/change-password", req.url));
    }

    // Authenticated users should not access auth pages
    if (pathname.startsWith("/auth") && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Allow unauthenticated access to auth pages; protect everything else
      authorized: ({ req, token }: { req: any; token: any }) => {
        if (req.nextUrl.pathname.startsWith("/auth")) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/change-password"],
};