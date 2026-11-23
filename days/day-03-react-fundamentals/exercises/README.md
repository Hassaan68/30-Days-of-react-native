# Day 03 Exercises: Interactive Achievement Badge List

Practice typed props, `PropsWithChildren`, `useState`, immutable state updates, conditional rendering, and lists with stable `key`s.

## How to Practise

1. Open [`./BadgeListExercise.tsx`](./BadgeListExercise.tsx) and work through the `// TODO:` steps for each tier.
2. Preview your component live using `npm start` from the repository root (or render it inside `app/index.tsx` in your Expo playground).
3. Run strict checks after each change:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### 1. Beginner — Reusable `BadgePill` Component & Keyed List

**Requirements**
- Complete `BadgePill` with strictly typed props (`label: string`, `earned: boolean`, `onPress: () => void`).
- Visually distinguish **earned** badges (for example, warm amber background/border and dark amber text) from **locked** badges (neutral slate tint), and add pressed feedback on `<Pressable>`.
- Include `accessibilityRole="button"` and a clear `accessibilityLabel` stating whether the badge is earned or locked.
- Render all badges in `visibleBadges` using `.map()` with `key={badge.id}`.

**Acceptance Criteria**
- [ ] Earned and locked badges look clearly different at a glance.
- [ ] Every badge pill uses `badge.id` (not the array index) as its `key`.
- [ ] Pressing a pill gives visual feedback (`opacity` or color shift).

**Expected Behavior**
- On initial load, `"★ First Expo App"` renders with the earned highlight style while the other three badges render in their locked neutral style.

<details>
<summary>Hint</summary>

Pass a function to `<Pressable style={({ pressed }) => [...]} />` combining `styles.pill`, `earned ? styles.pillEarned : styles.pillLocked`, and `pressed && styles.pressed`. Apply a matching conditional style to `<Text>` inside the pill.

</details>

---

### 2. Intermediate — Toggle Earned State & Derived Progress

**Requirements**
- Implement `handleToggleBadge(badgeId: string)` so tapping any `BadgePill` immutably flips that badge's `earned` property inside `badges` state.
- Compute `earnedCount` directly during render from `badges` (do **not** add a separate `useState` for the count).
- Display `"{earnedCount} of {badges.length} badges earned"` in the summary text.

**Acceptance Criteria**
- [ ] Tapping any badge toggles it between earned (`★`) and locked (`○`) immediately.
- [ ] The summary text updates automatically without a second `useState` or `useEffect`.
- [ ] Existing badge objects in state are never mutated in place.

**Expected Behavior**
- Starting at `"1 of 4 badges earned"`, tapping `"TypeScript Strict Pro"` switches it to `"★ TypeScript Strict Pro"` and updates the summary to `"2 of 4 badges earned"`.

<details>
<summary>Hint</summary>

Use `.map()` with object spread for the immutable update and `.filter()` for the derived count:
```tsx
const handleToggleBadge = (badgeId: string): void => {
  setBadges((previous) =>
    previous.map((badge) =>
      badge.id === badgeId ? { ...badge, earned: !badge.earned } : badge,
    ),
  );
};

const earnedCount = badges.filter((badge) => badge.earned).length;
```

</details>

---

### 3. Challenge — `Panel` Wrapper, Filters & Conditional Empty State

**Requirements**
- Keep the badge list wrapped inside the reusable `Panel` component typed with `PropsWithChildren<{ title: string }>`.
- Render three interactive filter chips for `'all' | 'earned' | 'locked'` (highlighting the active chip) and compute `visibleBadges` during render based on `filter`.
- Render a clean empty-state message (for example, `"No locked badges to display."`) whenever `visibleBadges.length === 0`.
- Render a congratulatory banner (`"All badges unlocked — great job!"`) using safe boolean `&&` conditional rendering when every badge is earned (`badges.length > 0 && earnedCount === badges.length`).

**Acceptance Criteria**
- [ ] Switching between **All**, **Earned**, and **Locked** filters the displayed badges immediately.
- [ ] Marking all 4 badges as earned displays the congratulatory banner AND switches the **Locked** tab to the empty-state message.
- [ ] Unchecking all 4 badges switches the **Earned** tab to the empty-state message without crashing.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
- Filtering never deletes badges from state—tapping back to **All** always restores all 4 badges with their latest earned/locked status.

<details>
<summary>Hint</summary>

Define `const FILTERS: readonly BadgeFilter[] = ['all', 'earned', 'locked'];` and map over it to render your filter row. Derive `allEarned = badges.length > 0 && earnedCount === badges.length` so `{allEarned && <View>...</View>}` is guaranteed to evaluate a boolean on the left side of `&&`.

</details>

## Reference Solution

<details>
<summary>Only after trying: view reference solution link</summary>

Compare your completed component with [`../solutions/BadgeListSolution.tsx`](../solutions/BadgeListSolution.tsx).

</details>
