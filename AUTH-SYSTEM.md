# Authentication System Documentation

## Overview

This document describes the authentication architecture implemented in the Workout app. The system uses Supabase Auth for user authentication and provides multiple layers of protection for different parts of the application.

## Authentication Components

The authentication system consists of four main layers:

1. **Route-level middleware** for broad protection of entire sections of the app
2. **Auth Provider Context** for global authentication state management
3. **Client-side hooks** for component-level protection
4. **Server-side utilities** for authentication in server components and server actions

## 1. Middleware

### Files:

- `/middleware.ts` (Root middleware)
- `/lib/utils/supabase/middleware.ts` (Helper function)

### Functionality:

The middleware intercepts all requests to protected routes and validates the user's authentication status before allowing access. It works as follows:

- `updateSession()` maintains authentication state across page navigations by refreshing tokens
- Routes with `/dashboard/*` pattern are automatically protected
- Unauthenticated users are redirected to `/auth/login` with the returnUrl parameter
- Authenticated users trying to access auth pages are redirected to `/dashboard`

```typescript
// Key middleware pattern
export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const returnUrl = encodeURIComponent(request.nextUrl.pathname);
      return NextResponse.redirect(`/auth/login?returnUrl=${returnUrl}`);
    }
  }

  return response;
}
```

## 2. Auth Provider Context

### Files:

- `/lib/providers/auth-provider.tsx`

### Functionality:

The AuthProvider manages authentication state on the client-side using React Context. It:

- Initializes and maintains the user session state
- Listens for auth state changes (login/logout events)
- Provides the authentication state to components via the useAuth() hook
- Handles sign-out functionality

```typescript
// Usage in components
import { useAuth } from "@/lib/providers/auth-provider";

function MyComponent() {
  const { user, isLoading } = useAuth();

  // Use auth state in your component
}
```

## 3. Client-Side Protection Hooks

### Files:

- `/hooks/use-require-auth.ts`
- `/hooks/with-auth.tsx`

### Functionality:

Two client-side hooks provide component-level protection:

#### useRequireAuth()

A hook that manages redirects for unauthenticated users.

- Redirects unauthenticated users to login page
- Can be configured to redirect authenticated users away from guest-only pages
- Provides loading state for UI feedback

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

- Wraps any component with authentication logic
- Provides consistent loading states
- Can be configured for guest-only pages

```typescript
// Usage
const ProtectedPage = withAuth(MyPage);
```

## 4. Server-Side Authentication

### Files:

- `/lib/utils/server-auth.ts`

### Functionality:

Server components and server actions need their own authentication mechanisms. The utilities include:

#### requireAuth()

Enforces authentication in server components and actions. Redirects to login if unauthenticated.

```typescript
// Usage in a Server Component
export default async function ProtectedServerPage() {
  const user = await requireAuth();
  return <div>Protected server content</div>;
}
```

#### getCurrentUser()

Gets the current user without forcing a redirect. Useful for conditional logic in server contexts.

```typescript
// Usage in a Server Action
export async function conditionalServerAction() {
  const user = await getCurrentUser();

  if (user) {
    // Authenticated logic
  } else {
    // Unauthenticated logic
  }
}
```

## 5. SafeAction Pattern for Protected Server Actions

The app uses a `safeAction` wrapper for server actions to provide consistent error handling. This integrates with the authentication system by calling `requireAuth()` inside protected actions.

```typescript
// Example of a protected server action
export async function protectedAction(data) {
  return safeAction(async () => {
    const user = await requireAuth();

    // Action implementation with authenticated user

    return { data: result, error: null };
  });
}
```

## Authentication Flow

1. Request hits middleware first
   - Session is refreshed via `updateSession()`
   - Route-level protection checks occur
2. If client-side route rendering is allowed:
   - AuthProvider initializes and syncs with Supabase
   - Components use auth hooks for fine-grained protection
3. For server components:
   - Server authentication utilities check session cookies
   - Redirect or render based on auth status
4. For server actions:
   - Authentication check using server utilities
   - Safe handling of success/error cases

## Best Practices

1. **Route-Level Protection**:

   - All sensitive routes should be under `/dashboard/*` for automatic middleware protection

2. **Client Components**:

   - Use `useRequireAuth()` for components that need auth data and custom loading states
   - Use `withAuth()` HOC for whole pages or layouts for simpler code

3. **Server Components**:

   - Always use `requireAuth()` for protected server components
   - Use `getCurrentUser()` for conditional rendering based on auth state

4. **Server Actions**:
   - Always wrap with `safeAction` for consistent error handling
   - Use appropriate server auth utility based on whether auth is required or optional

## Which Auth Method to Use Where

### For Client Components:

1. **useRequireAuth() Hook**:

   - Use for individual components that need direct access to user data
   - When you need to customize loading states
   - When you want direct control over auth flow in the component

2. **withAuth() HOC**:
   - Use for entire pages or layouts
   - When you prefer a more declarative approach
   - When you want consistent loading states across protected pages

### For Server Components:

- Always use **requireAuth()** for fully protected server components
- Use **getCurrentUser()** when you need conditional rendering based on auth state

## How to Add New Protected Features

1. For client components, use either:

   ```typescript
   function MyNewFeature() {
     const { user } = useRequireAuth();
     // Implementation
   }
   ```

   Or:

   ```typescript
   const MyNewFeature = withAuth(MyComponent);
   ```

2. For server components:

   ```typescript
   export default async function MyNewServerFeature() {
     const user = await requireAuth();
     // Implementation
   }
   ```

3. For server actions:
   ```typescript
   export async function myNewAction(data) {
     return safeAction(async () => {
       const user = await requireAuth();
       // Implementation
     });
   }
   ```
