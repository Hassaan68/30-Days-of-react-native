# Day 06: Core React Native Components

## Learning Objectives

By the end of Day 06, you will be able to:

- Build complete mobile interfaces using React Native's core UI primitives: `View`, `Text`, `Image`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `SectionList`, `Modal`, and `ActivityIndicator`.
- Map familiar web HTML elements (`<div>`, `<p>`, `<img>`, `<button>`, `<input>`, `<ul>`) directly to their native React Native counterparts.
- Choose the right scrolling container by comparing `ScrollView`, `FlatList`, and `SectionList`.
- Craft responsive touch interactions with `Pressable` (pressed-state styles and `hitSlop`) instead of legacy touchable wrappers.
- Display local and remote images properly with `Image`, and know when to upgrade to `expo-image` for advanced caching and blurhash placeholders.
- Present accessible overlays with `Modal` (using `animationType` and `onRequestClose`) and communicate asynchronous loading with `ActivityIndicator`.

## Prerequisites

- Completed [Day 05: Styling and Layout](../day-05-styling-and-layout/README.md).
- Comfortable with Flexbox, `StyleSheet.create`, `useState`, and `useMemo`.

## Why This Concept Matters

Every screen in a production mobile app—from an Instagram-style feed to a banking contact list or a checkout sheet—is assembled from these same ~10 core components. Picking the right primitive is what separates a janky prototype from a silky 60fps app: rendering a 500-row catalog inside a `ScrollView` can stall low-end Android phones, while switching to `FlatList` keeps scrolling fluid and memory usage tiny. Similarly, using `Pressable` with `hitSlop` makes small toolbar buttons comfortable for real thumbs, and handling `Modal`'s `onRequestClose` prevents broken Android Back gestures.

## Introduction

On the web, you build UIs out of HTML tags like `<div>`, `<p>`, `<img>`, `<button>`, and `<input>`. React Native does not render HTML—it renders real native iOS (`UIKit`) and Android (`Android View`) widgets through a clean set of **Core Components**.

Learning these ~10 primitives deeply unlocks 90% of every mobile screen you will ever build. Just as important as knowing *how* each component works is knowing *when* to use it—for example, why rendering 500 items inside a `ScrollView` tanks performance while a `FlatList` keeps scrolling and animations smooth.

## Concepts

### React Web vs. React Native: HTML Elements to Core Components

If you are coming from React on the web, use this quick mental map whenever you reach for an HTML tag:

| Web HTML Element | React Native Core Component | Native Backing (iOS / Android) | Key Difference to Remember |
| --- | --- | --- | --- |
| `<div>`, `<section>`, `<main>` | `<View>` | `UIView` / `ViewGroup` | Defaults to `display: flex` with `flexDirection: 'column'`; cannot hold raw text directly. |
| `<p>`, `<span>`, `<h1>`–`<h6>` | `<Text>` | `UITextView` / `TextView` | **All** visible strings must live inside `<Text>`; text styles only inherit across nested `<Text>` elements. |
| `<img>` | `<Image>` (or `expo-image`) | `UIImageView` / `ImageView` | Remote `{ uri }` images require explicit `width` & `height` (or `aspectRatio`), or they render at `0 × 0`. |
| `<button>`, `<a>` | `<Pressable>` | Native touch view | No default browser chrome; gives you pressed-state style callbacks and `hitSlop` touch expansion. |
| `<input>`, `<textarea>` | `<TextInput>` | `UITextField` / `EditText` | Uses `onChangeText={(text) => ...}` (plain string) instead of `onChange={(e) => e.target.value}`. Add `multiline` for text areas. |
| Scrollable `<div>` (short content) | `<ScrollView>` | `UIScrollView` / `ScrollView` | Mounts all children at once—great for forms or short screens, bad for long feeds. |
| Scrollable `<ul>` / `<li>` (long lists) | `<FlatList>` / `<SectionList>` | Virtualized native scroll view | Lazily mounts only items near the viewport so large lists stay fast and memory-safe. |
| `<dialog>` / overlay | `<Modal>` | Native modal presentation | Requires `animationType` and Android's `onRequestClose` callback. |

### 1. `View` and `Text`

- **`View`**: The universal layout container (similar to `<div>` on the web, backed by `UIView` on iOS and `android.view.ViewGroup` on Android). It supports Flexbox, borders, backgrounds, accessibility roles, and shadows.
- **`Text`**: Every visible string in React Native **must** be wrapped inside `<Text>`. Putting raw text directly inside a `<View>` throws a runtime error. Useful props include `numberOfLines`, `ellipsizeMode`, `selectable`, and `accessibilityRole="header"`.

### 2. `Image` (Local vs. Remote & `expo-image`)

React Native's built-in `Image` handles both bundled local assets and remote URLs, with slightly different rules:

- **Local static images** (`source={require('./assets/logo.png')}`): Bundled into your app binary by Metro. React Native reads their intrinsic pixel dimensions automatically, though styling `width`/`height` explicitly is still good practice for predictable layouts.
- **Remote network images** (`source={{ uri: 'https://...' }}`): Because the dimensions are unknown until the network response arrives, remote images **require explicit `width` and `height`** (or `aspectRatio`) in `style`; otherwise they render at `0 × 0` and appear invisible.
- **Sizing & cropping**: Control how the image fits its box with `resizeMode`: `'cover'` (fill and crop), `'contain'` (fit completely), `'stretch'`, or `'center'`.
- **When to upgrade to `expo-image`**: For avatar grids, social feeds, product catalogs, or offline-friendly galleries, reach for [`expo-image`](https://docs.expo.dev/versions/latest/sdk/image/) (already included in this repo's `package.json`). It provides automatic disk and memory caching, smooth crossfade transitions, SVG/WebP/AVIF support, and BlurHash/ThumbHash placeholders out of the box—replacing `resizeMode` with CSS-like `contentFit="cover"`.

### 3. `Pressable` (Preferred Over `TouchableOpacity`)

`Pressable` is the modern, future-proof component for touch interactions:

- Pass a **style function** `style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}` for full control over opacity, background tint, or subtle scale feedback.
- Use **`hitSlop`** (e.g., `hitSlop={8}` or `hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}`) to enlarge the touch target of small icons without altering visual layout.
- Supports `onPress`, `onLongPress`, `onPressIn`, `onPressOut`, and `disabled`.

### 4. `TextInput`

`TextInput` handles single-line and multi-line text entry. Always treat it as a **controlled input** (`value` + `onChangeText`) for predictable state:

- `keyboardType`: `'default'`, `'email-address'`, `'numeric'`, `'phone-pad'`
- `returnKeyType`: `'done'`, `'search'`, `'next'`, `'send'`
- `autoCapitalize`: `'none'`, `'sentences'`, `'words'`
- `secureTextEntry`: masks passwords
- `multiline`: enables multi-line text areas

### 5. `ScrollView` vs. `FlatList` vs. `SectionList`

Choosing the wrong scrolling container is one of the most common beginner mistakes in React Native:

| Component | How It Renders | Best Used For | Avoid When |
| --- | --- | --- | --- |
| **`ScrollView`** | Renders **all** children immediately into memory | Short screens, forms, settings pages, horizontal chip bars (< ~20 items) | Long feeds or dynamic lists of unknown length |
| **`FlatList`** | **Virtualizes** rows—only mounts items near the viewport | Feeds, search results, chat logs, catalogs (20 to 10,000+ items) | Grouped data with sticky category headers |
| **`SectionList`** | Virtualizes **grouped** sections with headers/footers | Contacts (A–Z), team directories, grouped transaction history | Simple flat arrays |

> **Important rule**: Never nest a vertical `FlatList` or `SectionList` inside a vertical `ScrollView`. Instead, put header content above the list using `FlatList`'s `ListHeaderComponent` prop (and footer content in `ListFooterComponent`). A horizontal `ScrollView` inside a vertical `FlatList` (like filter chips) is completely fine!

### 6. `Modal` and `ActivityIndicator`

- **`Modal`**: Renders native overlay dialogs and bottom sheets above the current screen.
  - Use `visible` (`boolean`), `transparent` (`boolean`), and `animationType` (`'none' | 'slide' | 'fade'`).
  - **Do NOT use the removed `animated` prop**—it was removed from modern React Native; always use `animationType`.
  - **Always provide `onRequestClose`**: Android requires this callback to handle the hardware/gesture Back button cleanly.
- **`ActivityIndicator`**: Displays the native spinning loader (`UIActivityIndicatorView` on iOS, `ProgressBar` on Android) with `size` (`'small' | 'large'`) and `color`.

## Code Examples

> **How to run these interactive screens**: Both examples below are **runnable self-contained screen components** wrapped in `SafeAreaProvider` and `SafeAreaView`.
> - **In this repository**: Run `npm start` from the repo root to open the shared Expo launcher on iOS Simulator, Android Emulator, or Expo Go and preview Day 06 directly.
> - **In your own Expo Router project**: Copy either file into `app/gallery.tsx` or `app/contacts.tsx` (or import it into `app/index.tsx`).

### Example 1: Interactive Core Components Gallery (Runnable Screen)

- **File**: [`./examples/CoreComponentsGallery.tsx`](./examples/CoreComponentsGallery.tsx)
- **Type**: Runnable screen component (default export `CoreComponentsGallery`)
- **Suggested Expo placement**: `app/index.tsx` or `components/CoreComponentsGallery.tsx`

Combines nearly every core component into one cohesive screen:

- `FlatList` with `ListHeaderComponent`, `ItemSeparatorComponent`, and `ListEmptyComponent`
- `TextInput` for live search filtering
- Horizontal `ScrollView` for category filter chips (`All`, `Layout`, `Input`, `Lists`, `Feedback`)
- `Pressable` with `hitSlop` and pressed visual states
- `Image` thumbnails, `ActivityIndicator` sync state, and a slide-up `Modal`

### Example 2: Grouped Team Directory with `SectionList` (Runnable Screen)

- **File**: [`./examples/ContactsSectionList.tsx`](./examples/ContactsSectionList.tsx)
- **Type**: Runnable screen component (default export `ContactsSectionList`)
- **Suggested Expo placement**: `app/contacts.tsx` or `components/ContactsSectionList.tsx`

Demonstrates a clean `SectionList` implementation featuring:

- Grouped sections (`Engineering`, `Design`, `Product`) with `stickySectionHeadersEnabled`
- Live filtering that automatically hides empty sections
- Typed `SectionListRenderItem` and `renderSectionHeader`

## Step-by-Step Explanation

Let's examine how [`CoreComponentsGallery.tsx`](./examples/CoreComponentsGallery.tsx) avoids common pitfalls:

1. **Single Vertical Virtualized Container**: The root scrolling element is `<FlatList>`, not `<ScrollView>`. The header, search input, and horizontal category chips live inside `ListHeaderComponent`, so the entire screen scrolls as one unified native view without triggering nested-scroll warnings.
2. **Memoized Filtering (`useMemo`)**: `filteredItems` recomputes only when `searchQuery` or `selectedCategory` changes, keeping typing inside `TextInput` snappy.
3. **Stable Keys**: `keyExtractor={(item) => item.id}` gives React Native a unique, persistent ID for every row so animations and state do not jump when the list filters.
4. **Accessible Touch Feedback**: Each card uses `<Pressable hitSlop={6} accessibilityRole="button">` and computes pressed styling via `({ pressed }) => [styles.card, pressed && styles.cardPressed]`.
5. **Safe Cross-Platform Modal**: `<Modal visible={selectedItem !== null} animationType="slide" transparent onRequestClose={() => setSelectedItem(null)}>` renders a dimmed backdrop and closes cleanly on both iOS button press and Android back gesture.

## Expected Output

When you preview **`CoreComponentsGallery.tsx`** in the Expo launcher (`npm start`), you should see:

```text
┌─────────────────────────────────────────┐
│ Core Components                 [ Sync ]│
│ Tap any card to inspect it in a Modal.  │
│ ┌─────────────────────────────────────┐ │
│ │ Search core components...           │ │
│ └─────────────────────────────────────┘ │
│ [ All ] [ Layout ] [ Input ] [ Lists ]  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [img] View & Text          [Layout] │ │
│ │       Fundamental building blocks...│ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [img] Pressable             [Input] │ │
│ │       Modern touch handler...       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

- **Tapping `Sync`** replaces the label with a white `ActivityIndicator` spinner for 800ms.
- **Typing in the search bar or tapping a category chip** filters the `FlatList` immediately; searching for `"zzzz"` displays the `"No matching components"` empty state.
- **Tapping any card** subtly scales/dims the card on press and slides up a rounded bottom sheet `Modal` over a dimmed backdrop; tapping **Close Details** (or pressing Android Back) dismisses it.
- **In `ContactsSectionList.tsx`**, you see three sticky team headers (`ENGINEERING 2`, `DESIGN 2`, `PRODUCT 2`) where tapping a teammate highlights the row and toggles `"View"` → `"Selected"`.

## Common Mistakes

1. **Putting raw text inside a `<View>`**
   - *Error*: `Text strings must be rendered within a <Text> component.`
   - *Troubleshooting tip*: Check conditional renders like `{count && <Text>New</Text>}` (when `count` is `0`, React renders `0` directly in `<View>`!). Always write `{count > 0 ? <Text>New</Text> : null}` instead.
2. **Forgetting dimensions on remote `<Image>`**
   - *Why it fails*: Network images have unknown size before download, so React Native defaults them to `0 × 0`.
   - *Fix*: Always specify `width` and `height` (or `aspectRatio`) in the image style.
3. **Using `ScrollView` with `.map()` for large lists**
   - *Why it fails*: Mounts hundreds of native views simultaneously, causing slow screen transitions and high memory use.
   - *Fix*: Use `FlatList` or `SectionList`.
4. **Nesting a vertical `FlatList` inside a vertical `ScrollView`**
   - *Error*: `VirtualizedLists should never be nested inside plain ScrollViews with the same orientation.`
   - *Fix*: Remove the outer `ScrollView` and move any top content into `FlatList`'s `ListHeaderComponent`.
5. **Using `Modal`'s removed `animated` prop or omitting `onRequestClose`**
   - *Fix*: Use `animationType="slide"` (or `"fade"` / `"none"`) and always supply `onRequestClose`.
6. **Using `index` as `keyExtractor` in dynamic lists**
   - *Why it fails*: When items are filtered or reordered, React reuses the wrong row state.
   - *Fix*: Always return a stable unique ID like `item.id`.

## Best Practices

- **Prefer `Pressable` everywhere** over legacy `TouchableOpacity` or `TouchableHighlight`.
- **Use `ListEmptyComponent` and `ItemSeparatorComponent`** on `FlatList` and `SectionList` to keep empty states helpful and spacing consistent.
- **Upgrade to `expo-image`** when loading lots of remote photos, avatars, or gallery grids to benefit from native disk caching and smooth transitions.
- **Set `keyboardShouldPersistTaps="handled"`** on scrollable forms so tapping a button while the keyboard is open fires the button immediately instead of only dismissing the keyboard.
- **Always provide `accessibilityLabel`** on icon-only buttons, images, and search inputs.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) for detailed requirements, acceptance criteria, and hints, then work inside [`./exercises/CatalogModalExercise.tsx`](./exercises/CatalogModalExercise.tsx):

1. **Beginner**: Wire up live case-insensitive `TextInput` search on the `FlatList` and add a helpful `ListEmptyComponent`.
2. **Intermediate**: Enhance each `Pressable` card with pressed-state styling and `hitSlop={6}`, and polish the detail `Modal` with bookmark and close actions.
3. **Challenge**: Complete the `"Bookmarks Only"` filter toggle, show a `"Saved"` pill on bookmarked rows, and wire up the `"Reload Catalog"` button with an `ActivityIndicator`.

## Solutions

Try completing the starter file on your own first before peeking at the reference solution!

<details>
<summary>Click to view solution notes &amp; links</summary>

Compare your completed exercise against [`./solutions/CatalogModalSolution.tsx`](./solutions/CatalogModalSolution.tsx).

Key highlights in the reference solution:
- Combines both `searchQuery` (matching `title` or `level`) and `showBookmarksOnly` inside a single `useMemo` filter depending on `[searchQuery, showBookmarksOnly, bookmarkedIds]`.
- Displays a dynamic result count (`X of Y lessons shown`) in the header and renders a green `"Saved"` pill badge on bookmarked cards.
- Guards `handleReload` with `if (isLoading) return;` to prevent double taps while the 600ms `ActivityIndicator` is active.
- Renders a contextual `ListEmptyComponent` message that adapts depending on whether `showBookmarksOnly` is enabled.

</details>

## Mini Project

**Quick Notes Drawer**: Build a single-screen Notes app using `FlatList`, `TextInput`, `Pressable`, and `Modal`. Include a `"+ New Note"` button that opens a `Modal` containing title and body `TextInput` fields, saves new notes into state, displays them in a `FlatList` with a `"Delete"` button on each row, and shows an empty-state callout when no notes exist.

## Key Takeaways

- React Native core components map directly to real native iOS and Android UI views rather than HTML DOM tags.
- Use `ScrollView` for short fixed layouts, `FlatList` for long lists, and `SectionList` for grouped lists with section headers.
- `Pressable` replaces older touchable components with flexible pressed-state styling and `hitSlop`.
- Local `require(...)` images know their dimensions at build time, while remote `{ uri }` images require explicit dimensions; reach for `expo-image` when you need production caching.
- Always configure `Modal` with `animationType` and `onRequestClose`.

## Further Reading

- [React Native Docs — Core Components and APIs](https://reactnative.dev/docs/components-and-apis)
- [React Native Docs — Pressable](https://reactnative.dev/docs/pressable)
- [React Native Docs — FlatList](https://reactnative.dev/docs/flatlist)
- [React Native Docs — SectionList](https://reactnative.dev/docs/sectionlist)
- [React Native Docs — Modal](https://reactnative.dev/docs/modal)
- [Expo Docs — `expo-image`](https://docs.expo.dev/versions/latest/sdk/image/)

## Progress Checklist

- [ ] Mapped common HTML tags to React Native core components
- [ ] Understood when to choose `ScrollView`, `FlatList`, and `SectionList`
- [ ] Studied `examples/CoreComponentsGallery.tsx` and `examples/ContactsSectionList.tsx`
- [ ] Completed the Beginner, Intermediate, and Challenge tasks in `exercises/CatalogModalExercise.tsx`
- [ ] Verified TypeScript (`npm run typecheck`) and ESLint (`npm run lint`) pass
- [ ] Tested keyboard behavior, search filtering, and modal dismissal on simulator or device

## Next Day

You now have every foundation needed for Week 1! Put everything together in [Day 07: Build Your First Mobile App](../day-07-first-mobile-app/README.md).
