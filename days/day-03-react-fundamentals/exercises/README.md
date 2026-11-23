# Day 03 Exercises: Interactive Achievement Badge List

Practice typed props, `PropsWithChildren`, `useState`, immutable state updates, conditional rendering, and lists with stable `key`s.

## Starter File

Open [`./BadgeListExercise.tsx`](./BadgeListExercise.tsx) and complete each `// TODO:` step.

## Tasks

### 1. Beginner — Reusable `BadgePill` Component & Keyed List
- Implement `BadgePill` with strictly typed props (`label: string`, `earned: boolean`, `onPress: () => void`).
- Render `INITIAL_BADGES` using `.map()` and each badge's unique `badge.id` as the `key`.

### 2. Intermediate — Toggle Earned State & Derived Progress
- Wire up `handleToggleBadge(id)` to immutably toggle `badge.earned` in `useState`.
- Compute `earnedCount` during render (without adding a second `useState`) and display `"X of Y badges earned"`.

### 3. Challenge — `Panel` Wrapper, Filters & Conditional Empty State
- Wrap the badge section inside a reusable `Panel` component typed with `PropsWithChildren<{ title: string }>`.
- Add filter chips for `'all' | 'earned' | 'locked'` and filter the rendered list accordingly.
- Render an empty-state message when no badges match the active filter, and show a congratulatory banner using safe boolean `&&` rendering when all badges are earned.

## Checking Your Work

Compare your completed component with [`../solutions/BadgeListSolution.tsx`](../solutions/BadgeListSolution.tsx).
