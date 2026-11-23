# Day 12 Exercises: Authentication & Route Guards

Practice protecting screens, handling session restoration states, and enforcing role-based access control using [`AuthGuardExercise.tsx`](./AuthGuardExercise.tsx).

## Setup

Review [`../examples/AuthContext.tsx`](../examples/AuthContext.tsx) and [`../examples/tokenStorage.ts`](../examples/tokenStorage.ts) before starting so you know the exact shape of `useAuth()`.

## Tasks

### 1. Beginner — Loading & Unauthenticated States
- Read `status`, `isAuthenticated`, and `user` from `useAuth()`.
- While `status === 'loading'`, render a centered `ActivityIndicator` and status label (`"Restoring your session..."`) so protected content never flashes on launch.
- When `!isAuthenticated`, render the provided `fallback` node (or a clean default sign-in prompt if no `fallback` is passed).

### 2. Intermediate — Redirect Callback & Role-Based Guard
- If `status === 'unauthenticated'` and `onUnauthenticated` is provided, invoke `onUnauthenticated()` inside a `useEffect` (never directly during render!).
- Support the optional `requiredRole` prop (`'member' | 'admin'`). If the user is signed in but `user.role !== requiredRole`, render an accessible "Access Denied" card displaying their current role and the required role.

### 3. Challenge — Sign-Out Action & Session Refresh
- Add a **"Switch Account"** button inside the Access Denied card that calls `signOut()` so an unauthorized user can quickly sign into an account with the right permissions.
- Add a **"Retry Session"** button on the default unauthenticated screen that triggers `refreshSession()`.

## Checking Your Work

Compare your completed component with [`../solutions/AuthGuardSolution.tsx`](../solutions/AuthGuardSolution.tsx) and run:

```bash
npm run typecheck
npm run lint
```
