# Day 06 Exercises: Core React Native Components

Practice combining `FlatList`, `TextInput`, `Pressable`, `Image`, `ActivityIndicator`, and `Modal` to build an interactive resource catalog.

## Starter File

Open [`./CatalogModalExercise.tsx`](./CatalogModalExercise.tsx). The starter compiles cleanly with strict TypeScript and ESLint; complete each `// TODO:` step in order.

## Tasks

### Exercise 1 (Beginner): Render a Searchable `FlatList`
1. Connect the `TextInput` to `searchQuery` so typing filters `CATALOG_ITEMS` by title or level (case-insensitive).
2. Render each item inside `FlatList` with an `Image` thumbnail, title, level badge, and duration.
3. Add a friendly `ListEmptyComponent` when zero items match the search query.

### Exercise 2 (Intermediate): Interactive `Pressable` & Detail `Modal`
1. Make each list row a `Pressable` with visual pressed feedback (`style={({ pressed }) => ...}`) and `hitSlop={6}`.
2. Tapping a row should store that item in `selectedItem` state and open a `Modal` (`animationType="slide"`, `transparent`, and `onRequestClose`).
3. Inside the `Modal`, display the full item summary, a `"Bookmark"` toggle button, and a `"Close"` button.

### Exercise 3 (Challenge): Bookmark Filter & Loading Feedback
1. Track bookmarked item IDs in state (`string[]`) and display a `"Saved"` badge directly on bookmarked list cards.
2. Add a `"Bookmarks Only"` filter toggle (`Pressable`) beside the search input.
3. Add a `"Reload Catalog"` button that displays an `ActivityIndicator` for 600ms while refreshing.

## Verification Checklist

- [ ] Uses `FlatList` with a stable `keyExtractor` (not array index)
- [ ] Uses `Pressable` (not `TouchableOpacity`) with pressed-state feedback
- [ ] Uses `Modal` with `animationType` (never the removed `animated` prop) and `onRequestClose`
- [ ] Displays an `ActivityIndicator` during simulated reload
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors

Compare your finished solution with [`../solutions/CatalogModalSolution.tsx`](../solutions/CatalogModalSolution.tsx).
