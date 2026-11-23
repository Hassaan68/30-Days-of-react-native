# Day 16: Lists and Performance

## Learning Objectives

By the end of Day 16, you will be able to:
- Explain how `FlatList` **virtualization** works and tune `keyExtractor`, `getItemLayout`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and `removeClippedSubviews`.
- Eliminate unnecessary list-item re-renders using `React.memo`, `useCallback`, and `useMemo` — and understand where **React Compiler** automates memoization versus where architecture still matters.
- Profile React Native apps with **React Native DevTools** and **React DevTools Profiler** flamegraphs to find real bottlenecks before optimizing.
- Optimize image-heavy feeds with **`expo-image`** (`cachePolicy`, `recyclingKey`, `contentFit`, `transition`).
- Avoid subtle performance traps like inline closures, inline style objects, and passing mutable collections to list rows.

## Prerequisites

- Completed [Day 15: Animations](../day-15-animations/README.md).
- Comfortable building lists with `FlatList` from Day 6 and using React hooks from Day 4.

## Introduction

Rendering 20 items in a `ScrollView` feels instant. Rendering 2,000 items with images, badges, and interactive buttons in a `ScrollView` freezes the app, spikes memory usage, and causes OS out-of-memory kills.

Mobile hardware has stricter CPU, memory, and battery budgets than desktop browsers. Today you will learn how React Native's virtualization engine works under the hood, how to measure wasted renders with flamegraphs instead of guessing, and how to build 60–120 FPS lists that scale effortlessly to thousands of items.

## Concepts

### 1. How `FlatList` Virtualization Works

Unlike `ScrollView` (which mounts **every** child immediately), `FlatList` builds on `VirtualizedList` to mount only the items currently visible on screen plus a configurable buffer above and below the viewport. As the user scrolls:

- Items entering the buffer window are mounted in batches.
- Items far outside the buffer window are replaced with lightweight blank spacers to reclaim memory.

Key virtualization props and when to tune them:

| Prop | What It Controls | Guidance |
| --- | --- | --- |
| `keyExtractor` | Unique, stable string ID per item | Always return a database/domain ID — never array `index` when items can be reordered or filtered. |
| `getItemLayout` | Precomputed `{ length, offset, index }` | Huge win for fixed-height rows: lets `FlatList` jump straight to any scroll offset without measuring every item. |
| `initialNumToRender` | Items rendered on initial mount | Set just enough to fill one screen (e.g., `8–12`) so first paint stays fast. |
| `maxToRenderPerBatch` | Items rendered per incremental scroll batch | Lowering (`8–10`) improves touch responsiveness; raising reduces temporary blank spaces during fast flings. |
| `windowSize` | Render window measured in viewport heights (default `21` = 10 above + 1 visible + 10 below) | Reducing to `5–9` cuts memory usage dramatically on image-heavy lists. |
| `removeClippedSubviews` | Detaches off-screen native views from the view hierarchy | Helpful on long Android lists; test carefully if rows have overflowing shadows or animated popovers. |

### 2. Memoization: `React.memo`, `useCallback`, `useMemo` — and React Compiler

When parent list state changes (for example, toggling a single favorite star or typing in a search box), React re-renders the parent and re-runs `renderItem` for visible rows.

- **`React.memo(RowComponent)`** skips re-rendering a row if every prop passes shallow equality (`Object.is`).
- **`useCallback`** preserves function reference stability so `onToggleFavorite` does not break `React.memo`.
- **`useMemo`** avoids re-running expensive filtering, sorting, or grouping computations on unrelated renders.
- **Primitive props beat object/collection props**: Pass `isFavorite={favoriteIds.has(item.id)}` (a boolean) instead of passing `favoriteIds` (a new `Set` reference on every toggle). When you toggle item #3, only item #3's boolean changes — all other visible rows skip re-rendering!

> **What about React Compiler?**
> Modern React (React 19+) supports the optional React Compiler, which automatically memoizes many expressions, closures, and JSX subtrees at build time. However, even with React Compiler enabled, **architectural choices** still matter: passing a whole `Set` instead of a boolean prop, omitting `getItemLayout`, or rendering uncached 4 MB images will still hurt performance. Knowing manual memoization also prepares you for codebases where the compiler is not enabled.

### 3. Profiling with React Native DevTools & Flamegraphs

**Rule #1 of performance work: measure first, optimize second.**

1. Launch your Expo app and press `j` in the terminal (or select **Open DevTools** from the dev menu) to open **React Native DevTools**.
2. Switch to the **Profiler** tab and enable **"Record why each component rendered while profiling"** in settings.
3. Click **Record**, perform one interaction (such as tapping a favorite button or scrolling), and click **Stop**.
4. Inspect the **Flamegraph** and **Ranked** charts:
   - **Gray bars** mean a component did **not** render (memoization worked!).
   - **Yellow/orange bars** indicate components that took longer to render.
   - Click any bar to see *why* it rendered (e.g., *"Props changed: onPress"* — a classic sign of an inline closure!).

### 4. Image Optimization with `expo-image`

Images are often the #1 cause of janky scrolling and memory spikes in mobile lists. `expo-image` uses native high-performance image pipelines (SDWebImage on iOS, Glide on Android):

- `cachePolicy="memory-disk"` caches decoded images across scrolls and app restarts.
- `recyclingKey={item.id}` tells the native image view to immediately clear stale pixels when a list cell is recycled for a new item — preventing the "wrong photo briefly flashing" glitch during fast scrolling.
- `contentFit="cover"` avoids distortion while sizing cleanly.
- Serve right-sized thumbnails from your backend/CDN (e.g., `160×160` for a 60pt avatar instead of a `4000×3000` raw photo).

## Code Examples

See [`examples/OptimizedProductList.tsx`](./examples/OptimizedProductList.tsx) for the full, runnable catalog list.

```tsx
const ProductRow = memo(function ProductRow({
  item,
  isFavorite,
  onToggleFavorite,
}: ProductRowProps) {
  const handlePress = () => {
    onToggleFavorite(item.id);
  };

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.thumbnail}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={item.id}
        transition={150}
      />
      {/* ... */}
    </View>
  );
});
```

```tsx
const getItemLayout = (
  _data: ArrayLike<ProductItem> | null | undefined,
  index: number,
) => ({
  length: ROW_HEIGHT,
  offset: ROW_HEIGHT * index,
  index,
});
```

## Step-by-Step Explanation

1. **Hoist pure functions outside the component**: `keyExtractor` and `getItemLayout` do not depend on component state, so defining them at module scope keeps their references permanently stable.
2. **Enforce an exact row height**: Setting `height: ROW_HEIGHT` (with `borderBottomWidth: 1` inside the row) guarantees `getItemLayout` computes pixel-accurate offsets without dynamic measurement.
3. **Pass stable callbacks + primitive state**: `handleToggleFavorite` uses the functional `setFavoriteIds((prev) => ...)` updater with an empty dependency array `[]`, so it never changes identity. Each `ProductRow` receives `isFavorite: boolean` instead of the `Set`.
4. **Notify `FlatList` via `extraData`**: Because `FlatList` is a `PureComponent` internally, passing `extraData={favoriteIds}` tells it to check visible rows when favorites change — and `React.memo` ensures only the toggled row actually re-renders.
5. **Optimize images for cell reuse**: `expo-image` with `cachePolicy="memory-disk"` and `recyclingKey={item.id}` prevents both redundant network fetches and stale-image flicker.

## Common Mistakes

- **Creating inline closures in `renderItem`**: Writing `onPress={() => handleSelect(item.id)}` creates a brand-new function reference every render, completely defeating `React.memo` on the row.
- **Creating inline style objects or arrays unnecessarily**: Passing `style={{ padding: 16 }}` allocates a new object on every render; define styles in `StyleSheet.create`.
- **Using array `index` as `keyExtractor`**: Filtering, inserting, or deleting items shifts indices, causing React to reuse the wrong component state and images for the wrong items.
- **Wrong `getItemLayout` math**: Forgetting separator height or variable-height rows causes jerky jumps when using `scrollToIndex`. Only use `getItemLayout` when row heights are truly predictable.
- **Benchmarking performance in Dev mode**: Development builds run unminified JS with extra React checks and dev tooling. Always verify frame rates in a **release build** on a physical device.

## Best Practices

- Measure with the React Native DevTools Profiler before adding `useMemo` or `useCallback` everywhere.
- Keep list row components shallow, focused, and wrapped in `React.memo` when rendering large datasets.
- Use `expo-image` with `recyclingKey` and right-sized thumbnails for any list containing remote images.
- Keep `windowSize` moderate (`5–9`) for media-heavy lists to keep memory usage predictable on older Android devices.
- Avoid rendering heavy shadows or deeply nested views inside every single row.

## Exercises

Head to [`exercises/README.md`](./exercises/README.md) and open [`exercises/MemoizedRowExercise.tsx`](./exercises/MemoizedRowExercise.tsx):

1. **Beginner**: Wrap `ContactRow` in `React.memo`, pass `onSelect: (id: string) => void` instead of an inline closure, and stabilize `handleSelect` with `useCallback`.
2. **Intermediate**: Add module-level `keyExtractor` and `getItemLayout`, memoize `filteredContacts` and `renderItem`, and tune `FlatList` virtualization props.
3. **Challenge**: Replace the placeholder avatar with `expo-image`'s `Image` component configured with `cachePolicy="memory-disk"`, `contentFit="cover"`, and `recyclingKey={contact.id}`.

## Solutions

Review the complete optimized reference implementation:

- [`solutions/MemoizedRowSolution.tsx`](./solutions/MemoizedRowSolution.tsx): Eliminates wasted row re-renders, computes exact fixed-height layouts, and leverages `expo-image` caching and recycling.

## Mini Project

Build a **1,000-Item News Feed** with:
- Category filter pills (`All`, `Tech`, `Design`, `Mobile`) memoized with `useMemo`.
- Bookmark toggle per article that re-renders **only** the toggled card (verify in React DevTools Profiler!).
- Cached thumbnails via `expo-image` and a "Scroll to Top" floating button powered by `flatListRef.current?.scrollToOffset({ offset: 0, animated: true })`.

## Key Takeaways

- `FlatList` virtualization keeps memory low by mounting only rows near the viewport.
- `getItemLayout` eliminates dynamic height measurement for fixed-height lists.
- `React.memo` only helps when props stay referentially stable — avoid inline closures and pass primitive booleans instead of collection references.
- Always profile with React Native DevTools flamegraphs to confirm your optimization actually reduced render work.
- Pair `FlatList` with `expo-image` (`recyclingKey` + `cachePolicy`) for crisp, flicker-free image scrolling.

## Further Reading

- [React Native: Optimizing FlatList Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [React Native: Performance Overview](https://reactnative.dev/docs/performance)
- [React Native DevTools Documentation](https://reactnative.dev/docs/react-native-devtools)
- [Expo Image Documentation](https://docs.expo.dev/versions/latest/sdk/image/)

## Progress Checklist

- [ ] Understood how `FlatList` virtualization and `windowSize` work
- [ ] Built a fixed-height list with `getItemLayout` and stable `keyExtractor`
- [ ] Eliminated wasted row re-renders using `React.memo`, `useCallback`, and primitive props
- [ ] Optimized list thumbnails with `expo-image` (`recyclingKey` and `cachePolicy`)
- [ ] Completed `MemoizedRowExercise` and verified zero `tsc` / ESLint errors

## Next Day

Continue to [Day 17: Local Storage and Offline Apps](../day-17-local-storage-and-offline/README.md) to persist data locally with AsyncStorage, SecureStore, and SQLite, and design reliable offline-first sync queues.
