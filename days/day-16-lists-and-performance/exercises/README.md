# Day 16 Exercises: Lists and Performance

Practice spotting and eliminating wasted re-renders in a virtualized `FlatList`.

## How to Practise

1. Open the starter file [`MemoizedRowExercise.tsx`](./MemoizedRowExercise.tsx). It intentionally contains several common list performance bottlenecks (inline closures, missing memoization, unoptimized `FlatList` props, and unmemoized filtering).
2. Complete each exercise level in order directly in `MemoizedRowExercise.tsx`.
3. Validate your TypeScript types and code style after each step:
   ```bash
   npm run typecheck
   npm run lint
   ```
4. Preview your component in the shared Expo workspace (`npm start`) by rendering `<MemoizedRowExercise contacts={...} />` with a list of 100+ sample contacts and profiling a row tap in React Native DevTools.

---

## Exercise 1 (Beginner): Memoize the Row and Stabilize Callbacks

### Requirements

- Wrap `ContactRow` in `React.memo`.
- Update `ContactRowProps` to accept `onSelect: (id: string) => void` instead of `onPress: () => void`, so `renderItem` no longer allocates a new inline arrow function per row on every render.
- Wrap `handleSelect` in `useCallback` with an empty dependency array `[]` (relying on the functional `setSelectedIds((prev) => ...)` updater).

### Acceptance Criteria

- [ ] `ContactRow` is wrapped with `memo(...)`.
- [ ] `renderItem` passes `onSelect={handleSelect}` directly without creating `() => handleSelect(item.id)`.
- [ ] `handleSelect` is wrapped in `useCallback(..., [])`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior

Tapping a contact toggles its `Select` / `Selected` state and row highlight, while React DevTools Profiler shows that **only the tapped row** re-renders and all other visible rows remain skipped (gray).

<details>
<summary>Hint</summary>

Inside `ContactRow`, create a local `const handlePress = () => { onSelect(contact.id); };` and pass `handlePress` to `<Pressable onPress={handlePress}>`. Because `onSelect` itself is a stable `useCallback` reference, `React.memo` compares `prevProps.onSelect === nextProps.onSelect` as `true` and skips re-rendering unchanged rows.

</details>

---

## Exercise 2 (Intermediate): Add Virtualization Props & `getItemLayout`

### Requirements

- Define `const ROW_HEIGHT = 76;` at module scope and reference `height: ROW_HEIGHT` inside `styles.row`.
- Hoist a pure `keyExtractor` function and a `getItemLayout` function outside the component.
- Memoize `filteredContacts` with `useMemo` (filtering by `fullName` or `role`, and returning `contacts` unchanged when the trimmed query is empty).
- Memoize `renderItem` with `useCallback` typed as `ListRenderItem<ContactItem>`.
- Add `getItemLayout`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`, and `keyboardShouldPersistTaps="handled"` to `FlatList`.

### Acceptance Criteria

- [ ] `ROW_HEIGHT = 76` matches both `styles.row.height` and `getItemLayout`'s `length` / `offset` math.
- [ ] `keyExtractor` and `getItemLayout` are declared outside `MemoizedRowExercise`.
- [ ] `filteredContacts` uses `useMemo` and `renderItem` uses `useCallback`.
- [ ] `FlatList` configures `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and `removeClippedSubviews`.

### Expected Behavior

Scrolling quickly through hundreds of contacts stays smooth, jumping to any index requires zero runtime height measurement, and typing in the search bar does not recreate `keyExtractor` or `getItemLayout`.

<details>
<summary>Hint</summary>

`getItemLayout` has the signature:

```ts
const getItemLayout = (
  _data: ArrayLike<ContactItem> | null | undefined,
  index: number,
) => ({
  length: ROW_HEIGHT,
  offset: ROW_HEIGHT * index,
  index,
});
```

</details>

---

## Exercise 3 (Challenge): Optimize Images with `expo-image`

### Requirements

- Import `Image` from `expo-image`.
- Replace the placeholder avatar `View` inside `ContactRow` with `<Image>` displaying `contact.avatarUrl`.
- Configure `contentFit="cover"`, `cachePolicy="memory-disk"`, `recyclingKey={contact.id}`, `transition={150}`, and a descriptive `accessibilityLabel`.

### Acceptance Criteria

- [ ] `Image` is imported from `expo-image` (not `react-native`).
- [ ] Avatar displays a 44×44 circular image (`borderRadius: 22`) with `contentFit="cover"`.
- [ ] `cachePolicy="memory-disk"` and `recyclingKey={contact.id}` are both set.
- [ ] `npm run typecheck` and `npm run lint` pass cleanly.

### Expected Behavior

Avatars fade in smoothly once, stay cached across scrolls and reloads, and never briefly flash another contact's photo when list cells are recycled during fast scrolling.

<details>
<summary>Hint</summary>

Pass `source={{ uri: contact.avatarUrl }}` and keep a subtle neutral `backgroundColor: '#E2E8F0'` on `styles.avatar` so each avatar circle renders a clean placeholder surface while loading.

</details>

---

## Reference Solution

<details>
<summary>Click to view solution link (only after trying!)</summary>

Compare your completed component with [`../solutions/MemoizedRowSolution.tsx`](../solutions/MemoizedRowSolution.tsx).

</details>
