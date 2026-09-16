# Authentication System Documentation

## Overview

This document describes the authentication architecture implemented in the Workout app. The system uses **NextAuth.js v4** (Credentials provider) with **bcrypt** password hashing and a **Prisma**-backed `users` table. It provides multiple layers of protection for different parts of the application.

## Authentication Components

The authentication system consists of four main layers:

1. **Route-level middleware** (`withAuth`) for broad protection of entire sections of the app
2. **`SessionProvider` (NextAuth)** for global authentication state management
3. **Client-side hooks** for component-level protection
4. **Server-side utilities** for authentication in server components and server actions

## 1. Middleware

### Files:

- `/proxy.ts` (Root middleware. In Next.js 16 the root middleware file was renamed from `middleware.ts` to `proxy.ts`.)

### Functionality:

The middleware intercepts all requests to protected routes and validates the user's authentication status (JWT cookie) before allowing access:

- `withAuth` from `next-auth/middleware` maintains the session across page navigations
- Routes matching `/dashboard/:path*` are automatically protected
- Unauthenticated users are redirected to `/auth/login`
- Authenticated users trying to access auth pages are redirected to `/dashboard`
- Users with `mustChangePassword` are redirected to `/change-password`

```typescript
// Key middleware pattern (proxy.ts in Next 16)
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/change-password"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthed = !!req.nextauth.token;
    const mustChangePassword = (req.nextauth.token as any)?.mustChangePassword;

    if (pathname.startsWith("/auth") && isAuthed) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (
      mustChangePassword &&
      !pathname.startsWith("/change-password") &&
      !pathname.startsWith("/api/auth")
    ) {
      return NextResponse.redirect(new URL("/change-password", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/auth")) return true;
        return !!token;
      },
    },
  }
);
```

## 2. Auth Provider (SessionProvider)

### Files:

- `/lib/providers/auth-provider.tsx` (wraps NextAuth `SessionProvider`, exported as `AuthProvider`)

### Functionality:

`AuthProvider` manages authentication state on the client using NextAuth's React bindings. It:

- Loads the session on app startup and refreshes it
- Satisfies the `useSession()` hook used by `useRequireAuth()`
- Works with `signIn`/`signOut` from `next-auth/react`

```typescript
// Usage in components
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  const user = session?.user;
}
```

## 3. Client-Side Protection Hooks

### Files:

- `/hooks/use-require-auth.ts`
- `/hooks/with-auth.tsx`

### Functionality:

Two client-side hooks provide component-level protection:

#### useRequireAuth()

A hook built on `useSession()` that exposes `{ user, session, isLoading }` and redirects unauthenticated users to the login page.

```typescript
// Usage
function ProtectedComponent() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return null; // Will redirect via the hook

  return <div>Protected content</div>;
}
```

#### withAuth() HOC

A Higher-Order Component for wrapping entire components with auth protection.

```typescript
// Usage
const ProtectedPage = withAuth(MyPage);
```

## 4. Server-Side Authentication

### Files:

- `/lib/auth.ts` (exports `authOptions` and `getServerUser()`)

### Functionality:

Server components, API routes and server actions authenticate through NextAuth's `getServerSession`.

#### getServerUser()

Returns the current authenticated user (`{ id, email, name, mustChangePassword }`) or `null` if unauthenticated.

```typescript
// Usage in a Server Action
import { getServerUser } from "@/lib/auth";

export async function conditionalServerAction() {
  const user = await getServerUser();

  if (user) {
    // Authenticated logic
  } else {
    // Unauthenticated logic
  }
}
```

## 5. SafeAction Pattern for Protected Server Actions

The app uses a `safeAction` wrapper for server actions to provide consistent error handling. Authenticated actions call `getServerUser()` internally.

```typescript
// Example of a protected server action
export async function protectedAction(id) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user?.id) return { data: null, error: "Debes iniciar sesión" };

    return { data: result, error: null };
  });
}
```

## Authentication Flow

1. Request hits middleware first
   - JWT cookie presence is validated via `withAuth`
   - Route-level protection redirects happen
2. If client-side route rendering is allowed:
   - `SessionProvider` loads the session from NextAuth
   - Components use `useRequireAuth()` for fine-grained protection
3. For server components / server actions:
   - `getServerUser()` reads the session via `getServerSession`
   - Redirect or render based on auth status

## Password Storage & Change Password

- Passwords are hashed with **bcrypt** (10 rounds) and stored in `users.password_hash`
- New users from the `signUp` action are `must_change_password = false`
- The seed demo user (`demo@example.com`) is `must_change_password = false` too, so it signs in directly to the dashboard. Accounts that set `must_change_password = true` are forced to `/change-password` (API route `POST /api/auth/change-password`) where they must provide the current password and a new one (min. 8 chars), which updates `password_hash` and clears the flag

## Best Practices

1. **Route-Level Protection**: keep sensitive routes under `/dashboard/*` for automatic middleware protection
2. **Client Components**: use `useRequireAuth()` for components that need auth data and custom loading states
3. **Server Actions**: always wrap with `safeAction` and check `getServerUser()` when auth is required