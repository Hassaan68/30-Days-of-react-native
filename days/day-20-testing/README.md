# Day 20: Testing

## Learning Objectives

By the end of Day 20, you will be able to:

- Explain the mobile testing pyramid (static analysis, unit tests, component/integration tests, and end-to-end tests) and choose the right test type for each feature.
- Write fast, deterministic unit tests for pure TypeScript business logic with Jest.
- Test React Native components with `jest-expo` and `@testing-library/react-native` using `render`, `screen`, `fireEvent`, `userEvent`, and `waitFor`.
- Query elements the way real users and assistive technologies experience them (`getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`).
- Mock network calls (`jest.spyOn(globalThis, 'fetch')`) and Expo native modules cleanly while isolating tests.
- Structure components using dependency injection and pure helper modules so they are effortless to test.

## Prerequisites

- Completed [Day 19: Native Modules and Platform Differences](../day-19-native-modules-and-platform-differences/README.md).
- Comfortable with TypeScript, React hooks, and async/await error handling.
- Familiarity with running npm scripts (`npm test`, `npm run typecheck`, `npm run lint`).

## Why This Concept Matters

On the web, if a broken checkout or login screen slips into production, you can deploy a fix in two minutes. On iOS and Android, every binary release goes through App Store or Google Play review, and older app versions stay installed on users' phones for weeks. Automated unit and component tests give you a fast, repeatable safety net that catches broken pricing math, missing validation, and accessibility regressions in seconds — long before a build ever reaches your users.

## Introduction

Shipping a mobile app without automated tests is like deploying without a seatbelt: unlike a website where you can hotfix a broken checkout button in two minutes, a mobile bug can sit in app store review for days while users leave one-star reviews.

The secret to enjoying testing in React Native is testing **behavior, not implementation details**. You should rarely care what internal `useState` variable name a component uses. You care that when a user types an invalid email and taps **Sign in**, an accessible error alert appears and the login request is not sent.

Today we use **Jest** (`jest-expo` ~58.0.0) and **React Native Testing Library** (`@testing-library/react-native` 14.x) — the exact stack configured in this repository's `jest.config.js`.

> **React Native 0.88 / Expo SDK 58 Setup Note**
>
> When setting up testing in a fresh Expo SDK 58 + React Native 0.88 project, `jest-expo` 58 requires `@react-native/jest-preset` matching React Native `0.88` as a `devDependency`. Install the complete compatible set with:
>
> ```bash
> npx expo install jest-expo jest @react-native/jest-preset @testing-library/react-native --dev
> ```

## Concepts

### 1. The Mobile Testing Pyramid

```text
           /\
          /  \      End-to-End (E2E) — Maestro / Detox (few, slow, full device flows)
         /----\
        /      \    Component & Integration — jest-expo + RNTL (real user flows)
       /--------\
      /          \  Unit Tests — Jest (many, millisecond speed, pure TypeScript logic)
     /------------\
    / Static Checks \ TypeScript strict mode + ESLint (instant feedback in editor)
   /------------------\
```

- **Static checks (`tsc --noEmit`, `eslint`)**: Catch typos, missing null guards (`noUncheckedIndexedAccess`), and broken imports before code even runs.
- **Unit tests**: Verify pure functions (pricing, filtering, sorting, form validation) in milliseconds with zero React overhead.
- **Component & integration tests**: Render screens or widgets in Jest, simulate taps and typing, and verify rendered output and callbacks.
- **E2E tests**: Launch the compiled iOS/Android binary on a simulator (for example with Maestro) to test critical journeys like sign-up and checkout.

### 2. Unit Testing Pure TypeScript Functions with Jest

Pure functions take inputs and return outputs without touching network, storage, or React state. Always cover:

1. **Happy path**: Typical valid inputs.
2. **Edge cases**: Empty arrays, zero values, negative numbers, rounding boundaries.
3. **Failure cases**: Out-of-range parameters throwing a `RangeError` or returning a validation error.

```ts
describe('applyDiscountPercent', () => {
  it('applies a percentage discount rounded to the nearest cent', () => {
    expect(applyDiscountPercent(1000, 15)).toBe(850);
  });

  it('throws when discount exceeds 100%', () => {
    expect(() => applyDiscountPercent(1000, 120)).toThrow(RangeError);
  });
});
```

### 3. Component Testing with `jest-expo` and React Native Testing Library

`jest-expo` automatically configures React Native transforms and mocks core Expo globals. `@testing-library/react-native` (v14+) renders your component tree in React 19 and lets you interact with it cleanly using `async`/`await`:

- `await render(<Component />)`: Mounts the component into the virtual test tree.
- `screen`: Exposes query methods (`getByRole`, `getByLabelText`, `getByText`, `queryByText`, `findByText`) so you do not have to destructure queries from `render()`.
- `await fireEvent.press(el)` / `await fireEvent.changeText(input, 'text')`: Dispatches native touch and text-change events cleanly wrapped in `act`.
- `userEvent.setup()`: Simulates realistic multi-step user interactions asynchronously (`await user.press(el)`, `await user.type(input, 'text')`).
- `waitFor(() => { ... })`: Retries assertions until asynchronous state updates (such as resolved promises or API responses) settle.

> **React Web vs. React Native: React Testing Library (Web) vs. React Native Testing Library (RNTL)**
>
> | Concept | React Testing Library (Web) | React Native Testing Library (Mobile) |
> | --- | --- | --- |
> | **Tapping / Clicking** | `fireEvent.click(btn)` / `user.click(btn)` | `await fireEvent.press(btn)` / `await user.press(btn)` |
> | **Typing in Inputs** | `fireEvent.change(input, { target: { value: 'hi' } })` | `await fireEvent.changeText(input, 'hi')` / `await user.type(input, 'hi')` |
> | **Accessible Queries** | `getByRole`, `getByLabelText`, `getByText` (from HTML tags & ARIA) | `getByRole`, `getByLabelText`, `getByText` (from `accessibilityRole`, `accessibilityLabel`, and `<Text>`) |
> | **Test Environment** | `jsdom` / `happy-dom` browser DOM | `jest-expo` + `@react-native/jest-preset` native host tree (no DOM) |
> | **Role Matching Tip** | `<button>` has implicit `role="button"` | `<Pressable>` needs explicit `accessibilityRole="button"` so `getByRole('button')` finds it! |

### 4. Query Priority: Test Like a User

Choose queries in this order so your tests also enforce great accessibility:

1. **`getByRole`** (e.g., `screen.getByRole('button', { name: 'Sign in' })`, `screen.getByRole('alert')`) — mirrors how screen readers navigate your UI.
2. **`getByLabelText`** (e.g., `screen.getByLabelText('Email address')`) — ideal for form inputs.
3. **`getByPlaceholderText`** — useful when no explicit label is present.
4. **`getByText`** — great for headings, status banners, and rendered values.
5. **`getByTestId`** — last resort when no semantic label or text exists.

Remember the three query prefixes:

| Prefix | No match | 1 match | Async? | Best used for |
| --- | --- | --- | --- | --- |
| `getBy*` | Throws error | Returns element | No | Asserting something is currently visible |
| `queryBy*` | Returns `null` | Returns element | No | Asserting something is **not** rendered (`expect(...).toBeNull()`) |
| `findBy*` | Rejects promise | Resolves element | Yes | Waiting for async content to appear |

### 5. Mocking API Calls & Expo Native Modules

Never hit real production APIs in unit or component tests — tests become slow, flaky, and offline-broken.

**Mocking `fetch` with `jest.spyOn`:**

```ts
afterEach(() => {
  jest.restoreAllMocks();
});

it('fetches a user profile cleanly', async () => {
  const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => ({ id: 'u1', name: 'Ada Lovelace' }),
  } as Response);

  const response = await fetch('https://api.example.com/users/u1');
  const data = (await response.json()) as { id: string; name: string };

  expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/users/u1');
  expect(data.name).toBe('Ada Lovelace');
});
```

**Mocking an Expo native module:**

```ts
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
}));
```

Always call `jest.restoreAllMocks()` or `jest.clearAllMocks()` in `afterEach` so mock state from one test never leaks into the next.

### 6. Testable Architecture (Dependency Injection & Pure Helpers)

Compare these two designs:

- **Hard to test**: A `LoginCard` component hard-codes `axios.post(...)`, `SecureStore.setItemAsync(...)`, and inline regexes inside its button `onPress`. Testing it requires mocking three modules.
- **Easy to test**: `validateLoginCredentials` lives as a pure exported function, and `LoginCard` receives `onLogin: (credentials: LoginCredentials) => Promise<void>` as a prop. Unit tests verify validation in 1 ms, and component tests pass `jest.fn()` to simulate success, loading, and network errors deterministically!

## Code Examples

### Example 1: Pure Pricing Utilities

- **Type**: Reusable helper/module (pure TypeScript math & formatting functions)
- **File**: [`./examples/priceUtils.ts`](./examples/priceUtils.ts)
- **Where to place in an Expo project**: Save under `src/features/cart/utils/priceUtils.ts`.
- **How to run**: Imported and verified directly by `CounterWidget.test.tsx` via `npm test`.

It stores prices in integer cents to eliminate floating-point rounding bugs (`0.1 + 0.2 !== 0.3`) and validates negative inputs and discount ranges with `RangeError`.

### Example 2: Accessible `CounterWidget` Component

- **Type**: Runnable component
- **File**: [`./examples/CounterWidget.tsx`](./examples/CounterWidget.tsx)
- **Where to place in an Expo project**: Save under `src/features/cart/components/CounterWidget.tsx` and render inside any feature screen.
- **How to run**: Preview `<CounterWidget />` live in this repository's shared Expo launcher using `npm start` (or `npm run ios` / `npm run android`), and test it automatically via `CounterWidget.test.tsx`.

Notice how every interactive `Pressable` provides `accessibilityRole="button"`, a descriptive `accessibilityLabel`, and `accessibilityState={{ disabled }}`.

### Example 3: Passing Jest + RNTL Test Suite

- **Type**: Automated unit + component test suite
- **File**: [`./examples/CounterWidget.test.tsx`](./examples/CounterWidget.test.tsx)
- **Where to place in an Expo project**: Co-locate directly beside the component as `src/features/cart/components/CounterWidget.test.tsx`.
- **How to run**: Execute the suite directly with Jest (or run all repository tests via `npm test`):

```bash
npx jest days/day-20-testing/examples/CounterWidget.test.tsx
```

## Step-by-Step Explanation

1. **Integer arithmetic makes unit tests exact**: In [`./examples/priceUtils.ts`](./examples/priceUtils.ts), `calculateCartSummary` computes `subtotalCents`, `discountCents`, `taxCents`, and `totalCents` as integers using `Math.round()`, so assertions like `expect(summary.totalCents).toBe(5346)` never suffer floating-point surprises.
2. **Design for accessibility first, get testability for free**: In [`./examples/CounterWidget.tsx`](./examples/CounterWidget.tsx), adding `accessibilityRole="button"` and `accessibilityLabel="Increment counter"` immediately makes the widget screen-reader friendly AND lets [`./examples/CounterWidget.test.tsx`](./examples/CounterWidget.test.tsx) find it with `screen.getByRole('button', { name: 'Increment counter' })`.
3. **Assert observable outcomes, not internal state**: In `CounterWidget.test.tsx`, we never inspect React state hooks. We press buttons, assert that `Count: 3` appears on screen, and confirm the injected `onChange` callback was called with `3`.
4. **Test boundary conditions explicitly**: Pressing Increment twice when `max={2}` confirms that `count` never exceeds `2` and `onChange` is only fired once (when the value actually changed).

## Expected Output

Running `npx jest days/day-20-testing/examples/CounterWidget.test.tsx` produces a clean green test run covering both `priceUtils` unit tests and `CounterWidget` component tests:

```text
PASS  days/day-20-testing/examples/CounterWidget.test.tsx
  priceUtils
    ✓ calculates the subtotal in integer cents
    ✓ applies percentage discounts and rejects out-of-range discounts
    ✓ computes subtotal, discount, tax, and total accurately
    ✓ formats positive and negative cents as USD currency
  CounterWidget
    ✓ renders the initial count and updates when incremented or decremented
    ✓ enforces minimum and maximum boundaries
    ✓ resets back to the initial value when Reset is pressed

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

And when rendered interactively in the Expo launcher (`npm start`), `<CounterWidget initialValue={2} min={0} max={5} />` displays a rounded white card reading **Quantity Selector**, **Count: 2**, dark `-1` and blue `+1` buttons (dimming to muted gray when hitting `min` or `max`), and a **Reset** action underneath.

## Common Mistakes

- **Testing internal state or component method names**: Refactoring a component from `useState` to `useReducer` should not break your tests if the user-visible behavior stayed identical.
- **Using web DOM events (`fireEvent.click` / `fireEvent.change`) in RNTL**: React Native components emit `press` and `changeText` events — always use `fireEvent.press` / `fireEvent.changeText` (or `userEvent.press` / `userEvent.type`).
- **Forgetting `await waitFor(...)` for async state updates**: Triggering an async promise in `onPress` and asserting immediately causes flaky tests and React `act(...)` warnings.
- **Using `getByText` to assert absence**: `getBy*` throws immediately when an element is missing. Use `expect(screen.queryByText('Error')).toBeNull()` instead.
- **Leaving mocks uncleaned between tests**: A `mockRejectedValue` from test #1 can poison test #2 unless you create fresh mocks per test or reset them in `afterEach`.
- **Over-mocking everything**: If you mock every child component and helper, your test only proves your mocks work — not your app. Mock at the system boundary (network, storage, native hardware).

## Best Practices

- **Follow Arrange → Act → Assert (AAA)** in every test so each test reads like clear documentation.
- **Keep test descriptions user-focused**: Prefer `"displays an error alert when onLogin rejects"` over `"sets errorMessage state to string"`.
- **Extract complex calculations and validators into pure `.ts` files** so they can be exhaustively unit tested without rendering React trees.
- **Use dependency injection for side effects** (pass `onLogin`, `onSave`, or repository interfaces as props/arguments) to simplify mocking.
- **Run `npm test` in CI on every pull request** so regressions are caught before code is merged.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) for detailed requirements, acceptance criteria, and hints, then complete [`./exercises/LoginCardExercise.tsx`](./exercises/LoginCardExercise.tsx):

- **Beginner**: Implement `validateLoginCredentials` in `LoginCardExercise.tsx` to reject blank/invalid emails and passwords under 6 characters, and write Jest unit tests covering all three branches.
- **Intermediate**: Add `isSubmitting` loading state, `signedInEmail` success feedback, and `try / catch / finally` error handling to `LoginCardExercise.tsx`, then test valid submission and rejected login with `fireEvent` and `waitFor`.
- **Challenge**: Add a "Show / Hide password" toggle button (`accessibilityRole="button"`, `accessibilityLabel="Toggle password visibility"`) and write a component test verifying that pressing it toggles `secureTextEntry` and updates the button label without losing the typed password.

## Solutions

Try building `LoginCardExercise` and writing your own Jest + RNTL tests before inspecting the reference solution.

<details>
<summary>Click to view solution notes &amp; links</summary>

- **Component implementation**: [`./solutions/LoginCardSolution.tsx`](./solutions/LoginCardSolution.tsx)
- **Passing Jest & RNTL tests**: [`./solutions/LoginCardSolution.test.tsx`](./solutions/LoginCardSolution.test.tsx)
- **What changed**:
  - `validateLoginCredentials` trims the email, rejects empty strings or values missing `@`, rejects passwords shorter than 6 characters, and returns `null` when valid.
  - `LoginCardSolution` normalizes the email (`trim().toLowerCase()`), disables inputs and the Sign in button while `isSubmitting` is `true` (updating the label to `"Signing in..."`), displays `"Welcome back, <email>!"` on resolution, and renders an `accessibilityRole="alert"` error banner on rejection inside `try / catch / finally`.
  - `LoginCardSolution.test.tsx` covers 3 pure unit tests for `validateLoginCredentials` and 3 RNTL component tests (invalid submission skipping `onLogin`, normalized successful login with `waitFor`, and rejected `onLogin` showing the alert).
- **Run the solution tests directly**:
  ```bash
  npx jest days/day-20-testing/solutions/LoginCardSolution.test.tsx
  ```

</details>

## Mini Project

**Tested Tip & Split Calculator**: Create a `tipCalculator.ts` helper module (`calculateTipSplit(billCents, tipPercent, peopleCount)`) and a `TipCalculatorCard.tsx` component with accessible inputs for bill amount, tip percentage presets (`10%`, `15%`, `20%`), and number of diners. Write a `TipCalculatorCard.test.tsx` suite with at least 6 passing tests covering edge cases (1 diner, 0% tip, invalid input handling, and live per-person totals).

## Key Takeaways

- Combine static TypeScript checks, fast unit tests, and user-centric RNTL component tests for maximum confidence with minimal maintenance cost.
- Query components by `accessibilityRole` and `accessibilityLabel` so tests stay resilient to refactors and protect accessibility.
- Use `fireEvent.press` / `fireEvent.changeText` (or `userEvent`), `waitFor` / `findBy*` for async UI updates, and `queryBy*` when asserting an element is not present.
- Pure helper modules and dependency injection turn tricky async UI flows into clean, deterministic tests.

## Further Reading

- [Expo Testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Library Documentation](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation (Mock Functions & Timers)](https://jestjs.io/docs/mock-functions)
- [React Native Testing Overview](https://reactnative.dev/docs/testing-overview)

## Progress Checklist

- [ ] Understand the mobile testing pyramid and when to write unit vs. component vs. E2E tests.
- [ ] Run and inspect [`CounterWidget.test.tsx`](./examples/CounterWidget.test.tsx).
- [ ] Complete [`LoginCardExercise.tsx`](./exercises/LoginCardExercise.tsx) with validation, loading, success, and error states.
- [ ] Compare your tests with [`LoginCardSolution.test.tsx`](./solutions/LoginCardSolution.test.tsx) and run `npm test`.
- [ ] Build the Tested Tip & Split Calculator mini project.

## Next Day

Continue to [Day 21: Build a Task Manager](../day-21-task-manager/README.md) for your Week 3 capstone project combining navigation structure, Zustand + AsyncStorage persistence, Zod validation, filtering/sorting, and unit tests!
