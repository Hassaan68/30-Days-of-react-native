# Day 16 Exercises: Lists and Performance

Practice spotting and eliminating wasted re-renders in a virtualized `FlatList`.

## Setup

Open [`MemoizedRowExercise.tsx`](./MemoizedRowExercise.tsx). The starter component intentionally has several common list performance bottlenecks (inline closures, missing memoization, unoptimized `FlatList` props, and unmemoized filtering).

## Tasks

### Exercise 1 (Beginner): Memoize the Row and Stabilize Callbacks
- Wrap `ContactRow` in `React.memo`.
- Change `ContactRow` so it receives `isSelected: boolean` and `onSelect: (id: string) => void` instead of an inline `() => handleSelect(item.id)` arrow function created inside `renderItem`.
- Wrap `handleSelect` in `useCallback`.

### Exercise 2 (Intermediate): Add Virtualization Props & `getItemLayout`
- Define a constant `ROW_HEIGHT = 76` and ensure `styles.row` uses `height: ROW_HEIGHT`.
- Implement `getItemLayout` and a stable `keyExtractor` outside the component.
- Add `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and `removeClippedSubviews` to `FlatList`.
- Memoize `filteredContacts` with `useMemo` and `renderItem` with `useCallback`.

### Exercise 3 (Challenge): Optimize Images with `expo-image`
- Replace the placeholder avatar circle with `Image` from `expo-image` using `item.avatarUrl`.
- Set `contentFit="cover"`, `cachePolicy="memory-disk"`, `recyclingKey={item.id}`, and `transition={150}`.

## Verification

Compare your result with [`../solutions/MemoizedRowSolution.tsx`](../solutions/MemoizedRowSolution.tsx) and verify:

```bash
npm run typecheck
npm run lint
```
