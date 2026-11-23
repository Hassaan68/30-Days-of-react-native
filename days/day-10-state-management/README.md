# Day 10: State Management

## Learning Objectives

By the end of Day 10, you will be able to:

- Distinguish between **local UI state**, **shared app/client state**, and **server/async state**—and pick the right tool for each.
- Lift state cleanly and build a **typed React Context** with a custom consumer hook and memoization/splitting to prevent unnecessary re-renders.
- Create scalable client stores with **Zustand v5** (`create`, fine-grained selectors, and `useShallow` from `zustand/react/shallow`).
- Persist Zustand state across app restarts and OS background kills using `persist` middleware + `@react-native-async-storage/async-storage`, including `partialize` and hydration tracking (`onRehydrateStorage`).
- Design a clean, modular state architecture that scales across dozens of screens.

## Prerequisites

- Completed [Day 09: Forms and Validation](../day-09-forms-and-validation/README.md).
- Comfortable with React hooks (`useState`, `useMemo`, `useCallback`, `useContext`) and TypeScript generics.

## Why This Concept Matters

As soon as an app grows past two or three screens, scattered state becomes the #1 source of bugs: a shopping cart badge on a tab icon disagrees with the checkout screen, a user's dark mode setting resets every time iOS or Android terminates the app in the background, or a naive global Context triggers dozens of unnecessary re-renders during scroll animations. Choosing the right state layer—local `useState`, split Context, Zustand v5 with `useShallow`, or TanStack Query—keeps your app fast, predictable, and easy to maintain.

## Introduction

Almost every bug in a growing mobile app comes down to state: a badge count that falls out of sync with the cart screen, a dark-mode toggle that resets after reopening the app, or a Context provider that causes 40 components to re-render whenever a single timer ticks.

The secret to great state management in modern React Native isn't putting *everything* into one giant global store—it's placing each piece of state in the **smallest, most specialized layer** that fits its lifecycle. Today you will master React Context, Zustand v5, and AsyncStorage persistence, and learn exactly when to use each (and when to leave server data to TanStack Query on Day 11).

## Concepts

### 1. The Four Layers of Mobile State

| State Category | Examples | Best Tool |
| --- | --- | --- |
| **Local UI state** | Modal open/closed, search input text, active accordion index | `useState` / `useReducer` (or lift to nearest common parent) |
| **Low-frequency environment state** | Theme colors, locale/i18n, dependency injection | **React Context** (typed + memoized/split) |
| **Shared client state** | Shopping cart, audio player controls, onboarding wizard, user preferences | **Zustand v5** (with fine-grained selectors) |
| **Server / remote cache state** | User profile from API, feed posts, paginated lists | **TanStack Query v5** (Day 11!) |

Keeping server data out of Zustand and keeping ephemeral UI toggles in local `useState` dramatically simplifies your codebase.

### React Web vs. React Native: Web vs. Mobile State Persistence

If you are used to browser `localStorage` on the web, persisting state on mobile comes with three important differences:

| Aspect | Web (`localStorage`) | Mobile (`@react-native-async-storage/async-storage`) |
| --- | --- | --- |
| **App Lifecycle** | Browser tabs stay open until closed or refreshed by the user. | iOS and Android aggressively **suspend and kill backgrounded apps** to reclaim RAM—in-memory state vanishes whenever the user switches to a camera or game and comes back later. |
| **Sync vs. Async API** | `localStorage.getItem()` is **synchronous**, so initial state is available on the very first render. | `AsyncStorage.getItem()` is **asynchronous** (`Promise<string | null>`). Your store briefly mounts with default values before disk data arrives—track `hasHydrated` in `onRehydrateStorage` to prevent theme flicker or premature redirects! |
| **Sensitive Data** | Avoid storing secrets in `localStorage` due to XSS. | `AsyncStorage` is **unencrypted** key-value storage. Store harmless preferences (theme, font size, draft filters) in `AsyncStorage`, and store auth tokens in **`expo-secure-store`** (Day 12 & Day 23). |

### 2. Lifting State Up & React Context Done Right

When two sibling components need the same state (such as a filter bar and a product list), **lift state up** to their closest shared parent first. Reach for **React Context** only when values are genuinely cross-cutting across many levels of the component tree (like theming).

To avoid performance pitfalls with Context:

1. **Type the context as `T | null`** and expose a custom hook (`useTheme()`) that throws a clear developer error if called outside the provider.
2. **Memoize the provider value** with `useMemo` and action functions with `useCallback` so parent re-renders don't recreate the context object.
3. **Split state and actions into separate contexts** (`ThemeStateContext` and `ThemeActionsContext`) when some components only trigger actions (like a toggle button) and don't need to re-render when state values change.

### 3. Zustand v5: Fast, Minimal Client Stores

**Zustand v5** gives you global state without wrapping your app in nested `<Provider>` trees—and components subscribe **only** to the slice they select:

```ts
import { create } from 'zustand';

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => ({
      items: [...state.items, { ...product, quantity: 1 }],
    })),
  clearCart: () => set({ items: [] }),
}));
```

#### Selectors & `useShallow` in Zustand v5

Always select the smallest value you need:

```ts
// Good: only re-renders when `items.length` changes
const count = useCartStore((state) => state.items.length);

// Bad: subscribes to the ENTIRE store — re-renders on any change
const store = useCartStore();
```

In **Zustand v5**, React's `useSyncExternalStore` requires selectors to return a referentially stable value when state hasn't changed. If a selector returns a new object or array literal (`(state) => ({ a: state.a, b: state.b })`), wrap it with **`useShallow`** from `'zustand/react/shallow'`:

```ts
import { useShallow } from 'zustand/react/shallow';

export function useCartSummary() {
  return useCartStore(
    useShallow((state) => ({
      itemCount: selectCartItemCount(state),
      subtotalCents: selectCartSubtotalCents(state),
    })),
  );
}
```

### 4. Persisting Zustand State with AsyncStorage

Mobile users expect settings like dark mode, font size, and notification preferences to survive closing the app (or OS background termination). Zustand's `persist` middleware pairs directly with `@react-native-async-storage/async-storage`:

```ts
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      /* state & actions */
    }),
    {
      name: 'thirtydays-user-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        fontScale: state.fontScale,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
```

Notice two crucial mobile details:
- **`partialize`**: Explicitly choose which fields get serialized to disk. Never persist transient flags like `hasHydrated`, loading spinners, or sensitive auth tokens (use `expo-secure-store` for tokens on Day 12/23!).
- **`onRehydrateStorage` & `hasHydrated`**: Because `AsyncStorage` is asynchronous, the store initializes with default values for a few milliseconds before disk data loads. Tracking `hasHydrated` lets you avoid flashing the wrong theme or redirecting prematurely.

### 5. Scalable State Architecture

Instead of one monolithic `useAppStore` containing 80 fields, organize stores by **domain feature**:

```text
src/
├── features/
│   ├── cart/store/useCartStore.ts
│   ├── preferences/store/usePreferencesStore.ts
│   └── audio/store/usePlayerStore.ts
└── shared/
    └── theme/ThemeContext.tsx
```

Each store stays small, self-contained, and trivial to unit-test.

## Code Examples

> **How to use these state modules**: Both files below are **reusable state modules** (not standalone screens)—import them into screens inside your Expo app or into Jest tests!
> - **In this repository**: Import `ThemeProvider` / `useTheme` or `useCartStore` / `useCartSummary` inside the shared Expo workspace (`npm start`) to experiment interactively, and validate strict types and lint with `npm run typecheck`, `npm run lint`, and `npm test`.
> - **In your own Expo project**: Place each module at the suggested path below so any screen can import it cleanly.

1. **Split-Context Theme Provider (Reusable Provider Module)**
   - **File**: [`./examples/ThemeContext.tsx`](./examples/ThemeContext.tsx)
   - **Type**: Reusable React Context provider + hooks module (`ThemeProvider`, `useTheme`, `useThemeActions`)
   - **Suggested Expo placement**: `shared/theme/ThemeContext.tsx` (wrap your root `app/_layout.tsx` in `<ThemeProvider>`)
   - **What it shows**: Integrates `useColorScheme()`, splits `ThemeStateContext` and `ThemeActionsContext` so toggle buttons don't re-render on color changes, and throws helpful errors if hooks are called outside `<ThemeProvider>`.

2. **Zustand v5 Shopping Cart Store (Reusable Store Module)**
   - **File**: [`./examples/useCartStore.ts`](./examples/useCartStore.ts)
   - **Type**: Reusable Zustand v5 store + pure selectors module (`useCartStore`, `selectCartItemCount`, `selectCartSubtotalCents`, `useCartSummary`)
   - **Suggested Expo placement**: `features/cart/store/useCartStore.ts`
   - **What it shows**: Curried `create<CartState>()(...)`, immutable CRUD actions (`addItem`, `removeItem`, `updateQuantity`, `clearCart`), pure derived selectors, and a `useCartSummary()` hook wrapped in `useShallow`.

## Step-by-Step Explanation

1. **Follow system appearance with `useColorScheme()`**: In `ThemeContext.tsx`, when `preference === 'system'`, the provider derives `'light'` or `'dark'` from the device's OS setting automatically.
2. **Split read vs. write contexts**: Components that only render a `"Switch Theme"` button call `useThemeActions()`, so they never re-render when `colors` change.
3. **Use curried `create<State>()(...)` in TypeScript**: Zustand v5 uses double parentheses `create<CartState>()(...)` so middleware like `persist` infers types accurately without manual workarounds.
4. **Compute derived values in selectors, not duplicated state**: Notice `useCartStore` does **not** store `itemCount` or `subtotalCents` as separate mutable fields. Computing them in pure selectors guarantees they can never drift out of sync with `items`.
5. **Wrap multi-field object selectors in `useShallow`**: Returning `{ itemCount, subtotalCents, isEmpty }` inside `useShallow` performs a shallow property comparison so components re-render only when one of those three values actually changes.

## Expected Output

Because `ThemeContext.tsx` and `useCartStore.ts` are reusable modules, here is the observable behavior when wired into your screens or exercised in code/tests:

```text
// Using useCartStore + selectors:
useCartStore.getState().addItem({ id: 'rn-book', name: 'RN Handbook', priceCents: 2900 });
useCartStore.getState().addItem({ id: 'rn-book', name: 'RN Handbook', priceCents: 2900 });

// In any screen calling useCartSummary():
// → { itemCount: 2, subtotalCents: 5800, isEmpty: false }

useCartStore.getState().updateQuantity('rn-book', 0);
// → Removes item cleanly: { itemCount: 0, subtotalCents: 0, isEmpty: true }
```

- **In `ThemeContext`**: Calling `cyclePreference()` cycles `'system' → 'light' → 'dark' → 'system'`. Components using `useTheme()` update their palette immediately, while a button component reading only `useThemeActions()` avoids re-rendering when `colors` change.
- **In `PreferencesStoreSolution` (persisted store)**: Changing `themeMode` to `'dark'` and `dailyReminderHour` to `20`, then force-closing and relaunching the app via `npm start`, rehydrates `themeMode: 'dark'` and `dailyReminderHour: 20` from `AsyncStorage` and flips `hasHydrated` from `false` → `true`.

## Common Mistakes

- **Calling `useCartStore()` Without a Selector**: Subscribing to the entire store object re-renders the component on every state mutation, defeating Zustand's biggest performance advantage.
- **Returning Unmemoized Objects from Zustand v5 Selectors**: Writing `useCartStore((s) => ({ a: s.a, b: s.b }))` without `useShallow` triggers infinite re-render errors (`getSnapshot should be cached`) in React 19 / Zustand v5!
- **Assuming Persisted State Is Available Synchronously on Mount**: Unlike web `localStorage`, `AsyncStorage` is async. Check `hasHydrated` before making one-time decisions (like onboarding redirects or splash-screen dismissal).
- **Storing API Responses in Zustand Manually**: Writing manual `isLoading`, `error`, and `data` flags in Zustand for every endpoint re-invents caching poorly. Use TanStack Query (Day 11) for server state.
- **Saving Sensitive Secrets in `AsyncStorage` Persist**: `AsyncStorage` is unencrypted on device storage. Persist harmless preferences in `AsyncStorage`, and store access/refresh tokens in `expo-secure-store`.
- **Mutating Arrays In-Place Inside `set()`**: Calling `state.items.push(product)` mutates the previous reference so React never detects a change. Always return new arrays (`[...state.items, ...]`, `.map()`, `.filter()`).

## Best Practices

- **Start Local, Promote Only When Needed**: Keep UI state in `useState` until two distant screens genuinely need to share it.
- **Co-locate Pure Selectors Next to the Store**: Export functions like `selectCartSubtotalCents(state)` so screens and Jest unit tests share identical business logic.
- **Always Use `partialize` With `persist`**: Be intentional about what gets written to disk so future schema changes don't break hydration.
- **Handle Async Hydration Explicitly**: Gate splash screens or preference-dependent layouts on `hasHydrated` when initial flicker matters.
- **Keep Actions Inside the Store**: Defining actions directly inside `create(...)` gives them stable references (no `useCallback` needed when passing actions to child components).

## Exercises

Head to [`./exercises/README.md`](./exercises/README.md) for detailed requirements, acceptance criteria, and hints, then open [`./exercises/PreferencesStoreExercise.ts`](./exercises/PreferencesStoreExercise.ts):

### Beginner
Complete `setThemeMode`, `setFontScale`, `toggleNotifications`, and `setDailyReminderHour` (clamping the hour to an integer between `0` and `23`).

### Intermediate
Add Zustand `persist` middleware with `createJSONStorage(() => AsyncStorage)` under key `'thirtydays-user-preferences'`, use `partialize` to persist only `PreferencesData`, and update `hasHydrated` in `onRehydrateStorage`.

### Challenge
Implement `resetPreferences()` (restoring defaults without resetting `hasHydrated`) and refactor `useDisplayPreferences()` to use `useShallow` from `'zustand/react/shallow'`.

## Solutions

Try completing all three exercise levels in `PreferencesStoreExercise.ts` first before viewing the reference solution!

<details>
<summary>Click to view solution notes &amp; links</summary>

Compare your work against the complete reference solution:

- **[`./solutions/PreferencesStoreSolution.ts`](./solutions/PreferencesStoreSolution.ts)**

Key highlights in the reference solution:
- Extracts a tiny `clampHour(hour)` helper (`Math.min(23, Math.max(0, Math.round(hour)))`) so decimals and out-of-range numbers are always normalized cleanly.
- Uses curried `create<PreferencesState>()(persist((set) => ({ ... }), { ... }))` with `createJSONStorage(() => AsyncStorage)` and `partialize` returning strictly `PreferencesData`.
- Marks hydration complete inside `onRehydrateStorage: () => (state) => { state?.setHasHydrated(true); }`.
- Preserves `hasHydrated` inside `resetPreferences: () => set({ ...DEFAULT_PREFERENCES })` because Zustand merges partial state objects at the top level.
- Uses `useShallow` inside `useDisplayPreferences()` so toggling notifications never triggers re-renders in theme or typography consumers.

</details>

## Mini Project

**Persisted Settings & Mini Cart Playground**: Build a two-tab screen combining today's patterns:

1. **Shop Tab**: Displays 4 courses/products with `"Add to Cart"` buttons powered by `useCartStore` and a sticky header badge powered by `useCartSummary()`.
2. **Settings Tab**: Lets the user switch `themeMode` (`system`, `light`, `dark`), pick `fontScale`, toggle notifications, and reset preferences—all persisted via `PreferencesStoreSolution.ts`.
3. Close and reload the app to confirm your settings automatically rehydrate from `AsyncStorage`.

## Key Takeaways

- Match each piece of state to the right layer: local `useState`, React Context (environment), Zustand v5 (shared client state), and TanStack Query (server state).
- Unlike browser `localStorage`, mobile `AsyncStorage` is asynchronous and apps get killed in the background—always pair `persist` with `partialize` and `hasHydrated` tracking.
- Typed React Context with split state/actions avoids cascading re-renders across your app tree.
- Zustand v5 selectors + `useShallow` provide fine-grained reactivity with minimal boilerplate.

## Further Reading

- [Zustand v5 Documentation](https://zustand.docs.pmnd.rs/)
- [Zustand Persist Middleware Guide](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [React Context Documentation](https://react.dev/learn/passing-data-deeply-with-context)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)

## Progress Checklist

- [ ] Can decide cleanly between local state, Context, Zustand, and TanStack Query
- [ ] Understood why mobile state persistence (`AsyncStorage`) is asynchronous and requires hydration tracking
- [ ] Built a typed React Context with split state/actions and custom consumer hooks
- [ ] Built a Zustand v5 store with immutable updates and derived selectors
- [ ] Used `useShallow` safely for multi-field selectors in Zustand v5
- [ ] Persisted a Zustand store to `AsyncStorage` with `partialize` and `hasHydrated`
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `exercises/PreferencesStoreExercise.ts`

## Next Day

Continue to [Day 11: API Integration](../day-11-api-integration/README.md) to master typed networking with `fetch`, Axios interceptors, and TanStack Query v5.
