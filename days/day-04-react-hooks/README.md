# Day 04: React Hooks

Hooks are the engine that powers modern React and React Native apps. On Day 03 you met `useState`; today you will master the full core Hooks toolkit—**`useState` (functional updates & lazy initialization)**, **`useEffect` (dependencies & cleanups)**, **`useRef` (mutable values & native component refs)**, **`useMemo`**, **`useCallback`**, and **custom hooks**—plus the Rules of Hooks and how to avoid the #1 source of React bugs: unnecessary `useEffect`s.

## Learning Objectives

By the end of Day 04, you will be able to:

- Use `useState` functional updaters (`prev => ...`) and lazy initializer functions (`useState(() => compute())`).
- Synchronize components with external systems (timers, subscriptions, network requests) using `useEffect` with accurate dependency arrays and cleanup functions.
- Store mutable values across renders without triggering re-renders—and control native components like `TextInput`—using `useRef`.
- Optimize expensive calculations with `useMemo` and stabilize function references with `useCallback` only when appropriate.
- Extract reusable stateful logic into strictly typed custom hooks (`useToggle`, `useDebounce`).
- Follow the Rules of Hooks and replace unnecessary `useEffect` calls with derived state or event handlers.

## Prerequisites

- Completed [Day 03: React Fundamentals](../day-03-react-fundamentals/README.md).
- Comfortable with TypeScript generics, closures, and `setTimeout` / `setInterval`.

## Why This Concept Matters

Static screens are rare in real mobile apps. Almost every production feature—live search with debouncing, workout timers, auto-focusing the next input field, listening to keyboard or sensor subscriptions, or keeping expensive list filtering silky-smooth at 60 FPS—depends on choosing the right React Hook and cleaning up side effects properly. Mastering hooks now prevents memory leaks, stale closures, and sluggish re-renders across every app you build.

## Introduction

Mobile screens do more than render static cards: they run countdown timers, debounce search input as a user types, focus a `TextInput` when a button is pressed, listen to keyboard or network events, and filter large lists cleanly. **React Hooks** give functional components structured, composable ways to manage state, side effects, refs, and performance—without ever writing legacy class components.

## Concepts

### 1. `useState`: Functional Updates & Lazy Initialization

Two patterns separate beginners from seasoned React Native engineers:

1. **Functional updates:** Whenever the next state depends on the previous state—especially inside timers, async callbacks, or multiple sequential updates—pass an updater function so you never read a stale closure value:
   ```tsx
   // Safe even when called multiple times in one tick or inside setInterval
   setElapsedMs((prev) => prev + 100);
   ```
2. **Lazy initialization:** If computing initial state is expensive (e.g., parsing JSON or generating a large dataset), pass a **function** to `useState`. React invokes it only on the very first render instead of on every re-render:
   ```tsx
   // Runs once on mount, NOT on every render
   const [items, setItems] = useState<string[]>(() => buildInitialCatalog());
   ```

### 2. `useEffect`: Dependencies & Cleanup Functions

`useEffect` lets you synchronize your component with an **external system**—timers (`setInterval` / `setTimeout`), native device listeners, WebSockets, or data fetches.

```tsx
useEffect(() => {
  const timerId = setInterval(() => {
    setSeconds((prev) => prev + 1);
  }, 1000);

  // Cleanup runs before the next effect execution AND when the component unmounts
  return () => {
    clearInterval(timerId);
  };
}, []);
```

How the dependency array controls execution:

| Dependency Array | When the Effect Runs |
| --- | --- |
| `[a, b]` | On mount, and whenever `a` or `b` changes (`Object.is` comparison). |
| `[]` | Once on mount; cleanup runs once on unmount. |
| Omitted (rare) | After **every** render (almost never what you want). |

Always include every reactive value read inside the effect in its dependency array—the `eslint-plugin-react-hooks` rule (`react-hooks/exhaustive-deps`) enforces this automatically in this repository.

### 3. `useRef`: Mutable Values & Native Component Refs

`useRef<T>(initialValue)` returns a persistent `{ current: T }` object that survives across renders. Unlike `useState`, **mutating `ref.current` does NOT trigger a re-render**.

> **React 19.3 + React Native 0.88 Note:** In React 19.3 TypeScript types, `useRef` always requires an initial value argument (for example, `null`). Furthermore, under **React Native 0.88's Strict TypeScript API**, `TextInput` is typed as a function component rather than a class—so use **`useRef<TextInputInstance>(null)`** (importing `type TextInputInstance` from `'react-native'`), NOT `useRef<TextInput>(null)`. `TextInputInstance` is the imperative ref type that exposes native methods such as `.focus()`, `.blur()`, and `.clear()`.

Two main use cases in React Native:

1. **Holding imperative references to native components** (e.g., focusing or clearing a `TextInput`, scrolling a `ScrollView` / `FlatList`):
   ```tsx
   import { useRef } from 'react';
   import { TextInput, type TextInputInstance } from 'react-native';

   const inputRef = useRef<TextInputInstance>(null);
   const focusSearch = () => inputRef.current?.focus();
   ```
2. **Storing non-UI mutable data across renders** (e.g., an interval ID, previous timestamp, or render counter).

> **React Web vs. React Native (Hooks Differences):**
> - **Refs point to native instances, not DOM nodes:** Instead of `useRef<HTMLInputElement>(null)`, React Native uses typed native instance handles like `useRef<TextInputInstance>(null)`.
> - **Lifecycle differs from browser `window`:** Mobile apps have no `window.addEventListener('resize')` or full-page reloads—instead, hooks synchronize with native timers, `AppState` (foreground/background), keyboard events, and navigation focus, while previous screens often stay mounted in a navigation stack (making `useEffect` cleanup essential!).

### 4. `useMemo` & `useCallback`

Every time a component re-renders, its local variables and inline functions are recreated. Usually that is completely fine and ultra-fast in Hermes! Reach for memoization **only when there is a real benefit**:

- **`useMemo(() => computeExpensiveValue(a, b), [a, b])`**: Caches a computed result between renders unless `a` or `b` changes. Useful for heavy filtering/sorting or keeping an object reference stable when passed to a memoized child or `useEffect`.
- **`useCallback((arg) => doWork(arg), [dep])`**: Caches a function reference between renders. Useful when passing a callback to a `React.memo` child component or listing a callback in another hook's dependency array.

### 5. Custom Hooks (`useToggle`, `useDebounce`)

A **custom hook** is simply a TypeScript function whose name starts with `use` that calls other React hooks to package reusable stateful behavior.

- **`useToggle(initialValue)`**: Encapsulates boolean state plus stable `toggle`, `setTrue`, and `setFalse` helpers.
- **`useDebounce<T>(value, delayMs)`**: Returns a delayed copy of `value` that updates only after `delayMs` of inactivity—perfect for search boxes so you do not fire an API request on every keystroke.

### 6. The Rules of Hooks

React tracks hooks by their **call order** on every render, so two rules are non-negotiable:

1. **Only call hooks at the top level** of a React function component or another custom hook—never inside `if` statements, `for` loops, nested functions, or after an early `return`.
2. **Only call hooks from React functions** (components or `use*` custom hooks)—never from plain TypeScript utility functions.

### 7. Avoiding Unnecessary `useEffect`s

`useEffect` is an escape hatch for external systems—not a general-purpose state synchronizer. You do **not** need `useEffect` for:

- **Derived state:** Do not copy props or state into another `useState` inside `useEffect`. Compute the derived value directly during render (or with `useMemo` if genuinely expensive).
- **User events:** Logic that runs because a user tapped a button belongs in the `onPress` event handler, not in a `useEffect` watching a flag.

```tsx
// BAD: Unnecessary effect + extra render cycle
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD: Compute directly during render
const fullName = `${firstName} ${lastName}`;
```

## Code Examples

- **Where to place in an Expo project:** Put reusable custom hooks (`useDebounce.ts`) inside `hooks/` (for example, `hooks/useDebounce.ts`), and place runnable screen components (`HooksShowcase.tsx`) in `app/index.tsx` or `components/HooksShowcase.tsx`.
- **Preview immediately:** Run `npm start` from the repository root to launch the shared Expo playground and try out `HooksShowcase` interactively on iOS, Android, or Web right away.

Inspect both examples in `./examples/`:

1. [`./examples/useDebounce.ts`](./examples/useDebounce.ts) *(reusable custom hooks module)* — Reusable generic `useDebounce<T>` hook and `useToggle` custom hook with clean TypeScript return types and timer cleanup.
2. [`./examples/HooksShowcase.tsx`](./examples/HooksShowcase.tsx) *(runnable interactive screen component)* — Interactive searchable catalog combining `useRef<TextInputInstance>(null)` to focus/clear input, `useDebounce` to smooth search updates, `useMemo` to filter items, `useCallback` for a memoized `TopicRow`, and `useToggle` to switch compact mode.

Here is the generic `useDebounce` hook from [`./examples/useDebounce.ts`](./examples/useDebounce.ts):

```ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
```

## Step-by-Step Explanation

1. **How `useDebounce` Works:** Every time `value` changes (for example, as the user types `'re'`, `'rea'`, `'reac'`), `useEffect` first runs the previous cleanup (`clearTimeout`) to cancel the pending timer, then schedules a fresh timeout for `delayMs`. Only once the user pauses typing for `delayMs` does `setDebouncedValue` execute.
2. **Imperative Focus with `useRef`:** In `HooksShowcase.tsx`, `searchInputRef` is attached to `<TextInput ref={searchInputRef} />`. Tapping the **Clear** button resets `query` to `''` and calls `searchInputRef.current?.focus()` so the user can immediately type a new search term.
3. **Memoized Filtering (`useMemo`) and Memoized Rows (`React.memo` + `useCallback`):** `filteredTopics` is memoized on `debouncedQuery`. `handleSelectTopic` is wrapped in `useCallback` so `TopicRow` (wrapped in `memo`) avoids unnecessary re-renders when unrelated state like `compactMode` toggles.
4. **No Redundant Effects:** Notice how the selected topic summary and filtered list count are derived cleanly during render without a single unnecessary `useEffect`.

## Expected Output

When you preview `HooksShowcase` in Expo, you see a clean searchable list of 6 React Hooks topics:

```text
React Hooks Showcase

[ Search hooks (debounced 250ms)... ]  [ Clear ]

Showing 6 of 6                         ( Compact: OFF )

+----------------------------------------------------+
| useState & Functional Updates                      |
| Core                                               |
+----------------------------------------------------+
| useEffect & Cleanups                               |
| Core                                               |
+----------------------------------------------------+
```

- Typing `"ref"` waits `250ms` after your last keystroke (via `useDebounce`), then smoothly narrows the list to **`Showing 1 of 6`** (`useRef & TextInput Focus`).
- Tapping **Clear** resets the search box to empty and immediately focuses the `TextInput` via `searchInputRef.current?.focus()`.
- Tapping **Compact: OFF** switches it to **Compact: ON**, hiding each row's category subtitle and tightening row padding.
- Tapping any row highlights it in blue and displays a green **`Selected: ...`** banner at the top.

## Common Mistakes

1. **Forgetting cleanup in `useEffect`:** Starting `setInterval`, `setTimeout`, or an event listener without returning a cleanup function leaks memory and updates unmounted components.
2. **Lying to the dependency array:** Silencing `react-hooks/exhaustive-deps` by omitting a dependency causes subtle stale-state bugs where your effect reads outdated variables. Fix the effect logic (or use functional `setState((prev) => ...)`) instead of suppressing the linter.
3. **Calling a hook conditionally:** Writing `if (!user) return null;` *before* `useEffect(...)` breaks React's internal hook order and throws a runtime error. Always call all hooks before any early `return`.
4. **Using `useEffect` to transform state:** Syncing `filteredList` from `items` + `query` inside `useEffect` causes a wasted extra render with stale UI. Compute derived values directly during render.
5. **Overusing `useMemo` and `useCallback` everywhere:** Wrapping trivial expressions (`a + b`) in `useMemo` adds memory and comparison overhead while hurting readability. Profile or memoize purposefully.

## Best Practices

- **Name custom hooks with `use` and return typed tuples or named objects** so callers get crisp autocomplete.
- **Always pair subscriptions and timers with cleanup functions** inside `useEffect`.
- **Prefer functional state updaters (`setState((prev) => ...)`)** inside timers and callbacks to avoid stale closures and reduce effect dependencies.
- **Keep effects focused on a single concern:** Two small `useEffect` blocks are far easier to reason about than one giant effect handling three unrelated subscriptions.

## Exercises

Head to [`./exercises/README.md`](./exercises/README.md) and edit [`./exercises/StopwatchExercise.tsx`](./exercises/StopwatchExercise.tsx).

### Beginner
Implement the **Start / Pause** and **Reset** controls of a stopwatch using `useState` and `useEffect` with a `100ms` interval (`setInterval`) and proper `clearInterval` cleanup. Format elapsed milliseconds cleanly as `MM:SS.d`.

### Intermediate
Add a **Lap** button that records immutable lap entries (`{ id: string; elapsedMs: number }`) into state and renders them in reverse chronological order with stable `key`s. Compute the fastest lap duration as **derived state** (no `useEffect`).

### Challenge
Extract the timer mechanics into a reusable custom hook **`useStopwatch()`** inside the file, use `useRef` to hold an optional lap note `TextInput` that auto-focuses when tapping **"Add Note"**, and stabilize the lap-recording callback with `useCallback`.

## Solutions

Try completing `StopwatchExercise.tsx` independently first before opening the reference notes below.

<details>
<summary>Click to view solution notes &amp; links</summary>

- [`./solutions/StopwatchSolution.tsx`](./solutions/StopwatchSolution.tsx): Complete `useStopwatch` custom hook with clean `setInterval` cleanup, functional state updates, `useRef<TextInputInstance>(null)` for lap notes, `useMemo` for fastest lap calculation, and `useCallback` for stable handlers.
- **Key details to compare:**
  - `useEffect` starts a `100ms` interval only when `isRunning` is `true` and returns `() => clearInterval(intervalId)` so pausing or unmounting never leaks timers.
  - `fastestSplitMs` is derived with `useMemo` directly from `laps` (with a `noUncheckedIndexedAccess` guard on `laps[0]`) instead of synchronizing a second `useState` in an effect.
  - `noteInputRef` is typed with `useRef<TextInputInstance>(null)` (importing `type TextInputInstance` from `'react-native'`) so `.focus()` is strictly type-safe under React Native 0.88.

</details>

## Mini Project

**Debounced Notes Filter:** Combine `useDebounce` from `./examples/useDebounce.ts` with a `TextInput` ref and `useState` to build a quick notes screen where users can:
1. Add a new note (clearing and re-focusing the input via `useRef`).
2. Filter notes with a `300ms` debounced search query.
3. Toggle a "Pinned Only" filter powered by `useToggle`.

## Key Takeaways

- Functional `useState` updaters prevent stale closures; lazy initializers prevent expensive recomputation on every render.
- `useEffect` is strictly for synchronizing with external systems—always declare complete dependencies and return a cleanup function.
- `useRef` persists mutable data without triggering re-renders and connects directly to native components like `TextInput`.
- Extract reusable hook logic into typed custom hooks (`useToggle`, `useDebounce`, `useStopwatch`).
- Reach for derived values and event handlers before writing a `useEffect`.

## Further Reading

- [React Official Docs — State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [React Official Docs — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React Official Docs — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React Official Docs — Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

## Progress Checklist

- [ ] Used `useState` functional updaters and lazy initializers
- [ ] Wrote `useEffect` hooks with accurate dependency arrays and cleanup functions
- [ ] Controlled a native `TextInput` with `useRef<TextInputInstance>(null)`
- [ ] Understood when to use (and when to skip) `useMemo`, `useCallback`, and `useEffect`
- [ ] Built reusable custom hooks (`useDebounce`, `useToggle`, `useStopwatch`)
- [ ] Completed `./exercises/StopwatchExercise.tsx` and reviewed `./solutions/StopwatchSolution.tsx`

## Next Day

Now that you have mastered React fundamentals and hooks, it is time to make your apps look great on every screen size! Continue to **[Day 05: Styling and Layout](../day-05-styling-and-layout/README.md)**.
