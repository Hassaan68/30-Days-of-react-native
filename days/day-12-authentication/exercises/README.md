# Day 12 Exercises: Authentication & Route Guards

Practice protecting screens, handling session restoration states, and enforcing role-based access control using [`AuthGuardExercise.tsx`](./AuthGuardExercise.tsx).

## How to Practise

1. Review [`../examples/AuthContext.tsx`](../examples/AuthContext.tsx) and [`../examples/tokenStorage.ts`](../examples/tokenStorage.ts) first so you know the exact fields returned by `useAuth()`.
2. Edit [`AuthGuardExercise.tsx`](./AuthGuardExercise.tsx) to replace each `TODO` step (Beginner → Intermediate → Challenge).
3. Test your guard wrapped inside `<AuthProvider>` in your Expo app / playground (or via `npm start` in this repository's shared Expo launcher), then validate from the repo root:

```bash
npm run typecheck
npm run lint
```

---

## Beginner — Loading & Unauthenticated States

### Requirements
- Read `status`, `isAuthenticated`, and `user` from `useAuth()`.
- While `status === 'loading'`, render a `SafeAreaView` (from `react-native-safe-area-context`) containing a centered `ActivityIndicator` and `"Restoring your session..."`.
- When `!isAuthenticated || !user`, render the custom `fallback` prop if supplied, or a clean default `"Sign In Required"` card otherwise.
- When authenticated, render `children`.

### Acceptance Criteria
- [ ] Protected `children` are never rendered while `status === 'loading'` or when `user` is `null`.
- [ ] Passing `<AuthGuardExercise fallback={<CustomLogin />}>` renders `<CustomLogin />` when signed out.
- [ ] Uses `SafeAreaView` from `react-native-safe-area-context` (not the deprecated `react-native` export).

### Expected Behavior
On launch, users see a spinner until token lookup completes; signed-out users see the fallback or Sign In Required prompt without ever glimpsing protected content.

<details>
<summary>Hint</summary>

Check states in strict priority order before rendering `children`:

```tsx
if (status === 'loading') {
  return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.helperText}>Restoring your session...</Text>
    </SafeAreaView>
  );
}

if (!isAuthenticated || !user) {
  return fallback ? <>{fallback}</> : <DefaultSignInCard />;
}
```

</details>

---

## Intermediate — Redirect Callback & Role-Based Guard

### Requirements
- When `status === 'unauthenticated'` and `onUnauthenticated` is passed, invoke `onUnauthenticated()` inside a `useEffect` (never directly in the render body).
- Support the optional `requiredRole?: UserRole` prop (`'member' | 'admin'`).
- If the user is authenticated but `requiredRole && user.role !== requiredRole`, render an accessible **"Access Denied"** card showing the required role, the user's email, and their current role.

### Acceptance Criteria
- [ ] `onUnauthenticated` fires in `useEffect` only when `status === 'unauthenticated'`, with `[status, onUnauthenticated]` in the dependency array.
- [ ] Signing in as `learner@example.com` (`member`) and rendering `<AuthGuardExercise requiredRole="admin">` displays the Access Denied UI instead of `children`.
- [ ] Signing in as `admin@example.com` (`admin`) renders `children`.

### Expected Behavior
Unauthorized members receive a clear explanation of why they cannot access an admin screen, and screens passing `onUnauthenticated={() => router.replace('/sign-in')}` redirect safely without React render warnings.

<details>
<summary>Hint</summary>

Keep side effects inside `useEffect`:

```tsx
useEffect(() => {
  if (status === 'unauthenticated' && onUnauthenticated) {
    onUnauthenticated();
  }
}, [status, onUnauthenticated]);
```

Then check `if (requiredRole && user.role !== requiredRole)` right after the `!isAuthenticated || !user` guard.

</details>

---

## Challenge — Sign-Out Action & Session Refresh

### Requirements
- Add a **"Switch Account"** `Pressable` inside the Access Denied card that calls `void signOut()` so the user can sign in with a different account.
- Add a **"Retry Session"** `Pressable` inside the default unauthenticated card that calls `await refreshSession()`.
- Track a local `isRetrying` boolean state so the Retry Session button disables itself and changes its label to `"Checking Session..."` while `refreshSession()` is running (resetting inside `finally`).
- Add `accessibilityRole="button"` to both `Pressable` controls.

### Acceptance Criteria
- [ ] Tapping **Switch Account** clears tokens via `signOut()` and transitions to the unauthenticated state.
- [ ] Tapping **Retry Session** disables the button during the async check and always re-enables it even if `refreshSession()` throws or returns `false`.
- [ ] `npm run typecheck` and `npm run lint` pass cleanly with zero warnings.

### Expected Behavior
Users stuck on either the Sign In Required card or the Access Denied screen have an immediate, accessible recovery path without restarting the app.

<details>
<summary>Hint</summary>

Wrap `refreshSession()` in `try / finally` so the button never gets stuck disabled:

```tsx
const handleRetrySession = async () => {
  setIsRetrying(true);
  try {
    await refreshSession();
  } finally {
    setIsRetrying(false);
  }
};
```

And invoke async handlers safely in `Pressable`: `onPress={() => { void handleRetrySession(); }}`.

</details>

---

## Reference Solution

<details>
<summary>Only after trying — view reference solution</summary>

Compare your completed component against [`../solutions/AuthGuardSolution.tsx`](../solutions/AuthGuardSolution.tsx), then run:

```bash
npm run typecheck
npm run lint
```

</details>
