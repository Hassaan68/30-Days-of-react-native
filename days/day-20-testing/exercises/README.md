# Day 20 Exercises: Unit & Component Testing

Build a testable `LoginCard` component with accessible labels and clean dependency injection, then verify its behavior with Jest and React Native Testing Library.

## How to Practise

1. Open the starter file [`LoginCardExercise.tsx`](./LoginCardExercise.tsx) and inspect the `TODO` comments.
2. Create a co-located test file `LoginCardExercise.test.tsx` in this folder to test your changes as you go.
3. Run your tests, typecheck, and lint after each step:
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```
4. You can also render `<LoginCardExercise onLogin={async () => {}} />` inside this repository's shared Expo launcher (`npm start`) to try the form interactively on a simulator or phone.

---

## Exercise 1 (Beginner): Pure Validation Helper & Unit Tests

### Requirements

- Complete `validateLoginCredentials(credentials)` in `LoginCardExercise.tsx`:
  - Trim `credentials.email` and return `"Please enter a valid email address."` if it is empty or does not include `@`.
  - Return `"Password must be at least 6 characters."` if `credentials.password.length < 6`.
  - Return `null` when both fields are valid.
- Write Jest unit tests in `LoginCardExercise.test.tsx` covering invalid/empty email, short password, and valid credentials.

### Acceptance Criteria

- [ ] `validateLoginCredentials({ email: '   ', password: 'secret123' })` returns `"Please enter a valid email address."`.
- [ ] `validateLoginCredentials({ email: 'dev@example.com', password: '123' })` returns `"Password must be at least 6 characters."`.
- [ ] `validateLoginCredentials({ email: 'dev@example.com', password: 'secret123' })` returns `null`.
- [ ] All unit tests pass with `npm test`.

### Expected Behavior

Pure validation tests run in milliseconds without rendering any React tree, and tapping **Sign in** with invalid inputs shows the error alert without calling `onLogin`.

<details>
<summary>Hint</summary>

Trim the email first (`const normalizedEmail = credentials.email.trim();`) before checking `!normalizedEmail || !normalizedEmail.includes('@')` so whitespace-only inputs are properly rejected.

</details>

---

## Exercise 2 (Intermediate): Async Submit, Loading, Success & Error States + RNTL Tests

### Requirements

- Add `isSubmitting` (`boolean`) and `signedInEmail` (`string | null`) state to `LoginCardExercise`.
- Inside `handleSubmit`:
  - Normalize the email with `email.trim().toLowerCase()` and validate before calling `onLogin`.
  - Clear previous error/success banners, set `isSubmitting` to `true`, and `await onLogin({ email: normalizedEmail, password })` inside `try / catch / finally`.
  - On success, display `"Welcome back, <normalizedEmail>!"`.
  - On rejection, display `error.message` (or a friendly fallback) inside `<Text accessibilityRole="alert">`.
  - Always reset `isSubmitting` to `false` in `finally`.
- Disable both `TextInput` fields (`editable={!isSubmitting}`) and the submit `Pressable` (`disabled={isSubmitting}`, `accessibilityState={{ disabled: isSubmitting }}`), changing the button text to `"Signing in..."` while submitting.
- Write RNTL component tests using `render`, `screen`, `fireEvent.changeText`, `fireEvent.press`, and `waitFor` covering:
  1. Validation error displayed and `onLogin` not called.
  2. Valid submission normalizes email, calls `onLogin`, shows the welcome message, and hides any alert (`queryByRole('alert')` is `null`).
  3. Rejected `onLogin` promise shows the error inside `screen.getByRole('alert')`.

### Acceptance Criteria

- [ ] Submitting with invalid fields renders `accessibilityRole="alert"` and never calls `onLogin`.
- [ ] Valid submission passes trimmed, lowercased email to `onLogin` and displays `"Welcome back, <email>!"`.
- [ ] Rejected `onLogin` displays the error message in an accessible alert and shows no welcome text.
- [ ] Submit button shows `"Signing in..."` and is disabled while `onLogin` is pending.
- [ ] `npm test`, `npm run typecheck`, and `npm run lint` all pass with zero errors.

### Expected Behavior

Users get immediate feedback at every stage of login (validation error, disabled loading button, welcome confirmation, or server error banner), and every state transition is proven by deterministic Jest tests.

<details>
<summary>Hint</summary>

With `@testing-library/react-native` v14 and React 19, `await` both `render(...)` and `fireEvent.*(...)`, and wrap assertions that depend on resolved/rejected promises inside `await waitFor(...)`:

```tsx
const mockLogin = jest.fn<Promise<void>, [LoginCredentials]>().mockResolvedValue(undefined);
await render(<LoginCardExercise onLogin={mockLogin} />);
await fireEvent.changeText(screen.getByLabelText('Email address'), '  Alex@Example.com  ');
await fireEvent.changeText(screen.getByLabelText('Password'), 'supersecret');
await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

await waitFor(() => {
  expect(screen.getByText('Welcome back, alex@example.com!')).toBeTruthy();
});
```

</details>

---

## Exercise 3 (Challenge): Accessible Password Visibility Toggle

### Requirements

- Add a `showPassword` boolean state (default `false`) to `LoginCardExercise`.
- Wire `secureTextEntry={!showPassword}` on the password `TextInput`.
- Add a toggle `Pressable` beside or below the password input with `accessibilityRole="button"`, `accessibilityLabel="Toggle password visibility"`, and visible text switching between `"Show"` and `"Hide"`.
- Write a component test verifying that typing a password, pressing `"Toggle password visibility"`, and pressing it again toggles `secureTextEntry` and updates the button text (`"Show"` → `"Hide"` → `"Show"`) without clearing the password value.

### Acceptance Criteria

- [ ] Password input starts masked (`secureTextEntry={true}`).
- [ ] Pressing the button with `accessibilityLabel="Toggle password visibility"` reveals the password (`secureTextEntry={false}`) and changes the visible label to `"Hide"`.
- [ ] Pressing again re-masks the password and preserves the typed text value.
- [ ] New RNTL test passes under `npm test` with zero `tsc` or ESLint errors.

### Expected Behavior

Users can double-check a mistyped password without retyping it, and screen-reader users hear a clear accessible button label.

<details>
<summary>Hint</summary>

You can assert on the `TextInput`'s props directly in RNTL after pressing the toggle:

```tsx
const passwordInput = screen.getByLabelText('Password');
expect(passwordInput.props.secureTextEntry).toBe(true);
await fireEvent.press(screen.getByRole('button', { name: 'Toggle password visibility' }));
expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
```

</details>

---

## Reference Solution

<details>
<summary>Click to view solution links (only after trying!)</summary>

- Component implementation: [`../solutions/LoginCardSolution.tsx`](../solutions/LoginCardSolution.tsx)
- Passing Jest & RNTL test suite: [`../solutions/LoginCardSolution.test.tsx`](../solutions/LoginCardSolution.test.tsx)

</details>
