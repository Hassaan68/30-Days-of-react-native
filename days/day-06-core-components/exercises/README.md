# Day 06 Exercises: Core React Native Components

Practice combining `FlatList`, `TextInput`, `Pressable`, `Image`, `ActivityIndicator`, and `Modal` to build an interactive resource catalog.

## How to Practise

1. Open the starter file [`./CatalogModalExercise.tsx`](./CatalogModalExercise.tsx). It compiles cleanly with strict TypeScript and ESLint; complete each `// TODO:` step in order.
2. Preview your changes interactively by running `npm start` from the repository root (or importing `CatalogModalExercise` into your Expo app's entry screen).
3. Verify your TypeScript types and code style at any point:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### Exercise 1 (Beginner): Render a Searchable `FlatList`

**Requirements**
1. Update `visibleItems` inside `useMemo` so typing in the `TextInput` filters `CATALOG_ITEMS` case-insensitively by `title` or `level`.
2. Ensure each `FlatList` row displays an `Image` thumbnail (with explicit dimensions), title, level, and duration.
3. Add a friendly `ListEmptyComponent` to `FlatList` when zero items match the active search query.

**Acceptance Criteria**
- [ ] Typing `"flex"` or `"BEGINNER"` immediately narrows the list to matching lessons.
- [ ] Clearing the search input restores all 4 lessons.
- [ ] Typing a query with zero matches renders a clear empty-state message instead of a blank screen.
- [ ] `FlatList` uses `keyExtractor={(item) => item.id}` (never array index).

**Expected Behavior**
As you type into `"Search lessons..."`, rows update immediately without losing keyboard focus. Searching `"advanced"` leaves only `"High-Performance Media & Caching"`.

<details>
<summary>Hint</summary>

Inside `useMemo`, normalize the query with `const normalized = searchQuery.trim().toLowerCase();` and return `CATALOG_ITEMS.filter(...)` checking `item.title.toLowerCase().includes(normalized) || item.level.toLowerCase().includes(normalized)`. Pass a `<View>` containing `<Text>` elements directly to `ListEmptyComponent={...}`.

</details>

---

### Exercise 2 (Intermediate): Interactive `Pressable` & Detail `Modal`

**Requirements**
1. Upgrade each row's `Pressable` to use a style callback (`style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}`) and `hitSlop={6}`.
2. Ensure tapping a row stores that item in `selectedItem` state and opens the `Modal` with `animationType="slide"`, `transparent`, and `onRequestClose={() => setSelectedItem(null)}`.
3. Polish the `Modal` sheet to display the lesson's level, duration, title, full summary, a `"Bookmark"` / `"Remove Bookmark"` toggle button, and a `"Close"` button.

**Acceptance Criteria**
- [ ] Pressing a row visibly responds (background tint, opacity, or subtle scale) and has a generous touch target via `hitSlop={6}`.
- [ ] Tapping any row slides up the detail sheet over a dimmed backdrop.
- [ ] Tapping `"Close"` or triggering the Android Back button (`onRequestClose`) dismisses the modal cleanly.
- [ ] Never uses the removed `Modal` `animated` prop or legacy `TouchableOpacity`.

**Expected Behavior**
Tapping `"Virtualized Lists Deep Dive"` opens a bottom sheet showing its `"Intermediate"` level, `"35 min"` duration, summary text, and working Bookmark and Close controls.

<details>
<summary>Hint</summary>

Define a `cardPressed` style in `StyleSheet.create` (for example, `backgroundColor: '#F1F5F9'` and `transform: [{ scale: 0.99 }]`). Inside the modal, guard `selectedItem` with `{selectedItem ? (...) : null}` so TypeScript narrows `selectedItem` to non-null before reading `selectedItem.id`.

</details>

---

### Exercise 3 (Challenge): Bookmark Filter & Loading Feedback

**Requirements**
1. Combine `showBookmarksOnly` and `bookmarkedIds` inside the `visibleItems` `useMemo` filter (don't forget `bookmarkedIds` in the dependency array!).
2. Render a styled `"Saved"` badge pill on bookmarked rows and show the saved count inside the `"Bookmarks Only"` toggle button.
3. Guard `handleReload` so tapping `"Reload"` while `isLoading` is already `true` does not start overlapping timers, and display an `ActivityIndicator` for 600ms while refreshing.

**Acceptance Criteria**
- [ ] Toggling a bookmark inside the modal immediately adds or removes the `"Saved"` pill on that card in the list.
- [ ] Enabling `"Bookmarks Only"` filters the list to bookmarked items (and still respects the search query!).
- [ ] Tapping `"Reload"` shows a spinning `ActivityIndicator` for 600ms and ignores duplicate taps until finished.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
Bookmarking one lesson and tapping `"Bookmarks Only"` displays only that saved lesson. Removing the bookmark while `"Bookmarks Only"` is active leaves the list empty and displays your `ListEmptyComponent`.

<details>
<summary>Hint</summary>

Check `const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(item.id);` inside `CATALOG_ITEMS.filter(...)` and include `bookmarkedIds` in `useMemo`'s dependency array `[searchQuery, showBookmarksOnly, bookmarkedIds]`. At the top of `handleReload`, add `if (isLoading) { return; }`.

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to open the reference solution link</summary>

Once you have tried all three levels and verified `npm run typecheck` and `npm run lint`, compare your implementation with [`../solutions/CatalogModalSolution.tsx`](../solutions/CatalogModalSolution.tsx).

</details>
