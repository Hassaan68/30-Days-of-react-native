# Day 20 Exercises: Unit & Component Testing

## Goal

Build a testable `LoginCard` component with accessible labels and clean dependency injection, then verify its behavior with Jest and React Native Testing Library.

## Starter File

Open [`LoginCardExercise.tsx`](./LoginCardExercise.tsx) and complete all `TODO` items.

### Tasks

1. **Pure validation helper (`validateLoginCredentials`)**:
   - Trim the email and reject values that are empty or missing `@`.
   - Reject passwords shorter than 6 characters.
   - Return `null` when both fields are valid, or a clear error message string otherwise.
2. **Accessible inputs and submit button**:
   - Add `TextInput` fields with `accessibilityLabel="Email address"` and `accessibilityLabel="Password"` (`secureTextEntry`).
   - Add a `Pressable` button with `accessibilityRole="button"` and `accessibilityLabel="Sign in"`.
3. **Async submit, loading, and error states**:
   - Validate before calling `onLogin`.
   - While `onLogin` is pending, disable the submit button and show `"Signing in..."`.
   - If `onLogin` resolves, display `"Welcome back, <email>!"`.
   - If `onLogin` rejects, display the error message inside a `<Text accessibilityRole="alert">`.
4. **Write tests**:
   - Create tests covering validation errors, successful login, and failed login rejection.

## Verification

- Run `npm test` to execute Jest across all test files.
- Run `npm run typecheck` and `npm run lint`.
- Compare your implementation and tests with [`../solutions/LoginCardSolution.tsx`](../solutions/LoginCardSolution.tsx) and [`../solutions/LoginCardSolution.test.tsx`](../solutions/LoginCardSolution.test.tsx).
