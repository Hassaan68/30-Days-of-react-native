# Day 03: React Fundamentals

React Native is built directly on **React 19.3**. Every screen, button, card, and modal you build is a React component. Today you will learn how to write clean, strictly typed functional components in TSX, pass data via props and `children`, manage local UI state with `useState`, compose smaller components into rich interfaces, conditionally render views safely, and render lists with stable `key`s.

## Learning Objectives

By the end of Day 03, you will be able to:

- Write functional React components using JSX/TSX syntax and TypeScript prop interfaces.
- Use optional props, default prop values, and `PropsWithChildren` for flexible wrapper components.
- Manage interactive local UI state with `useState` and understand how state changes trigger re-renders.
- Explain React's three-phase rendering lifecycle (**Trigger → Render → Commit**) and why rendering must stay pure.
- Compose small, single-responsibility components instead of building monolithic screens.
- Apply conditional rendering safely in React Native (`ternary`, `&&` with boolean guards, and early returns).
- Render arrays of data with stable, unique `key` props (and explain why array index keys cause bugs).

## Prerequisites

- Completed [Day 02: JavaScript and TypeScript for React Native](../day-02-javascript-typescript/README.md).
- Comfortable with TypeScript interfaces, destructuring, arrow functions, and `.map()` / `.filter()`.

## Introduction

React introduces a **declarative** way to build user interfaces. Instead of writing step-by-step instructions like *"find the button, change its color, hide the error banner, and insert three list items,"* you describe **what the UI should look like for a given state**, and React handles updating the native iOS and Android views for you.

Think of every component as a pure function:

```text
UI = Component(props, state)
```

When either `props` (data passed from a parent) or `state` (data owned by the component) changes, React re-runs your component function, compares the new element tree with the previous one, and updates only the native views that actually changed.

## Concepts

### 1. Functional Components & TSX

A React component is a TypeScript function whose name starts with an **uppercase letter** and returns JSX (a syntax extension that compiles to React element calls). With React 19's automatic JSX runtime (`"jsx": "react-jsx"`), you do not need to write `import React from 'react'` just to use JSX.

```tsx
import { StyleSheet, Text, View } from 'react-native';

export function GreetingBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Welcome to Day 03!</Text>
    </View>
  );
}
```

### 2. Typed Props, Default Props, and `PropsWithChildren`

**Props** (short for *properties*) are read-only inputs passed from a parent component to a child component. Never mutate props inside a child component.

- Define an explicit `interface` for every component's props.
- Mark optional props with `?` and supply defaults directly in parameter destructuring.
- Use React's `PropsWithChildren<T>` helper when a component wraps nested JSX passed via `children`.

```tsx
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SectionCardProps {
  title: string;
  subtitle?: string;
}

export function SectionCard({
  title,
  subtitle = 'React Native Essentials',
  children,
}: PropsWithChildren<SectionCardProps>) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}
```

### 3. `useState` and State Updates

While props flow down from parents, **`state`** is private memory owned by a component that persists across renders. Calling `useState` returns a two-element tuple: `[currentValue, setterFunction]`.

```tsx
const [isFollowing, setIsFollowing] = useState<boolean>(false);
```

Key rules about state updates:

- **Never mutate state directly** (e.g., `items.push(x)` does not trigger a re-render). Always pass a brand-new value, array, or object to the setter.
- **State updates are scheduled asynchronously and batched** by React. If the next state depends on the previous state, pass an updater function: `setCount((prev) => prev + 1)`.

### 4. The Rendering Lifecycle

Every UI update in React Native follows three predictable steps:

1. **Trigger:** An initial mount occurs, or a component (or one of its ancestors) calls a state setter (`setState`).
2. **Render:** React calls your component function to calculate the new JSX tree. **Rendering must be pure**—same props and state should produce the same JSX without side effects (no API calls or timers directly in the render body).
3. **Commit:** React's Fabric renderer applies only the minimal necessary changes to the underlying native iOS/Android views.

### 5. Component Composition

Instead of cramming 400 lines of UI into one screen component, break your interface into small, focused pieces—such as `Avatar`, `Badge`, `Card`, and `CourseRow`—and compose them together via props and `children`. Composed components are easier to read, reuse across screens, and test in isolation.

### 6. Conditional Rendering in React Native

There are three idiomatic ways to conditionally render UI:

1. **Early return:** Ideal for empty states, loading states, or error states.
   ```tsx
   if (courses.length === 0) {
     return <Text>No courses found.</Text>;
   }
   ```
2. **Ternary operator (`condition ? <A /> : <B />`):** Ideal when choosing between two alternatives.
3. **Logical AND (`condition && <A />`):** Ideal when rendering something or nothing—**as long as the left-hand side is strictly a boolean!**
   ```tsx
   {unreadCount > 0 && <Text>{unreadCount} unread</Text>}
   ```

### 7. Rendering Lists and Stable `key`s

Render collections with `.map()` and provide a unique, stable `key` prop on the outermost element returned for each item (usually `item.id`).

```tsx
{courses.map((course) => (
  <CourseItem key={course.id} course={course} />
))}
```

React uses `key` to match items between renders so it knows which items were added, removed, or reordered. Avoid using the array `index` as a `key` whenever a list can be filtered, reordered, or edited—doing so can attach state to the wrong item!

> **Note:** For long, scrollable datasets (dozens or thousands of items), you will learn to use virtualized lists like `FlatList` on Day 06 and Day 16. Today we focus on React's core list and `key` mechanics.

## Code Examples

Inspect both examples in `./examples/`:

1. [`./examples/ProfileCard.tsx`](./examples/ProfileCard.tsx) — Demonstrates component composition (`CardContainer` with `PropsWithChildren`, `StatusPill`, and `ProfileCard`), optional/default props, `useState` follow toggle, and safe conditional rendering.
2. [`./examples/CourseList.tsx`](./examples/CourseList.tsx) — Demonstrates rendering lists with stable `key`s, filtering state (`'all' | 'active' | 'completed'`), immutable state updates (`map`), and early-return empty states.

Here is an excerpt from [`./examples/ProfileCard.tsx`](./examples/ProfileCard.tsx):

```tsx
interface CardContainerProps {
  highlighted?: boolean;
}

export function CardContainer({
  highlighted = false,
  children,
}: PropsWithChildren<CardContainerProps>) {
  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted]}>
      {children}
    </View>
  );
}
```

## Step-by-Step Explanation

1. **Composition First (`ProfileCard.tsx`):** We split the UI into three cohesive building blocks: `CardContainer` (reusable visual shell using `PropsWithChildren`), `SkillTag` (small visual chip), and `ProfileCard` (combines them and owns the `isFollowing` + `followerCount` state).
2. **Optional & Default Props:** `ProfileCardProps` makes `bio` and `initialFollowers` optional. Defaulting `initialFollowers = 0` in parameter destructuring avoids `undefined` math bugs.
3. **Safe Conditional Rendering:** When `bio` is provided, we check `Boolean(bio)` (or `bio !== undefined && bio.length > 0`) before rendering `<Text>{bio}</Text>`, preventing raw falsy strings or numbers from crashing React Native.
4. **Interactive List Filtering (`CourseList.tsx`):** We keep the source `courses` array in state and the active `filter` (`'all' | 'active' | 'completed'`) in state. Notice we do **not** store `filteredCourses` in a separate `useState`—we compute it directly during render from `courses` and `filter` so state can never fall out of sync!
5. **Stable Keys & Immutable Toggling:** Every course card uses `key={course.id}`. Pressing a course calls `setCourses((prev) => prev.map(...))` to flip `completed` immutably.

## Common Mistakes

1. **Rendering a falsy number (`0`) or empty string with `&&` in React Native:**
   ```tsx
   // BAD — crashes in React Native when count === 0 ("Text strings must be rendered within a <Text> component")
   <View>{count && <Text>{count} items</Text>}</View>

   // GOOD — left side is guaranteed boolean
   <View>{count > 0 && <Text>{count} items</Text>}</View>
   ```
2. **Mutating props or state directly:** Writing `props.user.name = 'New'` or `courses.push(newCourse)` breaks React's change detection and causes stale UI.
3. **Using array indices as `key` on dynamic lists:** If you delete or filter item 0, every subsequent item shifts index, causing React to reuse the wrong internal component state.
4. **Duplicating derived values in `useState`:** Never store `completedCount` in a separate `useState` if it can be computed from `courses.filter((c) => c.completed).length` during render.
5. **Defining a component inside another component:** Declaring `function Child() {}` inside `function Parent() {}` recreates `Child` on every render, destroying its state every time `Parent` updates. Always define components at module scope.

## Best Practices

- **Keep components small and focused:** If a component exceeds ~120 lines or handles unrelated concerns, extract a subcomponent.
- **Derive values instead of syncing duplicate state:** Compute filtered lists, totals, and flags directly during render.
- **Use `PropsWithChildren` for layout wrappers:** Cards, modals, and section containers become dramatically more flexible when they accept `children`.
- **Use explicit union types for finite UI options:** Type filters as `'all' | 'active' | 'completed'` rather than loose `string`.

## Exercises

Head to [`./exercises/README.md`](./exercises/README.md) and edit [`./exercises/BadgeListExercise.tsx`](./exercises/BadgeListExercise.tsx).

### Beginner
Build a reusable `BadgePill` child component with typed props (`label: string`, `earned: boolean`, `onPress: () => void`) and render a list of achievement badges with stable `key`s (`badge.id`).

### Intermediate
Add `useState` to track which badges are earned so tapping any `BadgePill` immutably toggles its `earned` state, and display a derived progress summary (`"X of Y badges earned"`) without storing a duplicate count state.

### Challenge
Add a reusable `Panel` wrapper component typed with `PropsWithChildren`, add filter buttons (`'all' | 'earned' | 'locked'`), and display a clean conditional empty-state message whenever the active filter matches zero badges (using safe boolean conditional rendering).

## Solutions

Compare your completed component with the reference solution:

- [`./solutions/BadgeListSolution.tsx`](./solutions/BadgeListSolution.tsx): Complete implementation featuring `Panel` (`PropsWithChildren`), `BadgePill`, immutable badge toggling, filter tabs, derived summary counts, and safe empty-state rendering.

## Mini Project

**Interactive Habit Tracker Card:** Build a `HabitTracker` screen composed of three reusable components:
1. `SectionWrapper` (accepts `title` and `children` via `PropsWithChildren`).
2. `HabitRow` (displays habit title, streak count, and a `<Pressable>` checkbox).
3. `HabitSummary` (conditionally renders a celebration banner once all habits for the day are completed).

## Key Takeaways

- React components are pure TypeScript functions that map `(props, state)` to native UI trees.
- Type component props with interfaces, use destructuring defaults for optional props, and use `PropsWithChildren` for wrapper components.
- Always update `useState` immutably and compute derived values during render instead of duplicating state.
- Guard `&&` expressions with booleans in React Native so `0` or `''` never renders outside `<Text>`.
- Always use stable, unique IDs (like `item.id`) as `key` props when rendering lists.

## Further Reading

- [React Official Docs — Describing the UI](https://react.dev/learn/describing-the-ui)
- [React Official Docs — Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [React Official Docs — Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [React Official Docs — Rendering Lists](https://react.dev/learn/rendering-lists)

## Progress Checklist

- [ ] Built strictly typed functional components with interfaces and default props
- [ ] Composed wrapper components with `PropsWithChildren`
- [ ] Practiced immutable `useState` updates and derived state
- [ ] Applied safe boolean conditional rendering in React Native
- [ ] Rendered interactive lists with stable `key` props
- [ ] Completed `./exercises/BadgeListExercise.tsx` and compared with `./solutions/BadgeListSolution.tsx`

## Next Day

Ready to unlock effects, refs, memoization, and custom hooks? Continue to **[Day 04: React Hooks](../day-04-react-hooks/README.md)**.
