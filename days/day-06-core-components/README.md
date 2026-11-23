# Day 06: Core React Native Components

## Learning Objectives

By the end of Day 06, you will be able to:

- Build complete mobile interfaces using React Native's core UI primitives: `View`, `Text`, `Image`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `SectionList`, `Modal`, and `ActivityIndicator`.
- Choose the right scrolling container by comparing `ScrollView`, `FlatList`, and `SectionList`.
- Craft responsive touch interactions with `Pressable` (pressed-state styles and `hitSlop`) instead of legacy touchable wrappers.
- Display local and remote images properly with `Image`, and know when to upgrade to `expo-image` for advanced caching and blurhash placeholders.
- Present accessible overlays with `Modal` (using `animationType` and `onRequestClose`) and communicate asynchronous loading with `ActivityIndicator`.

## Prerequisites

- Completed [Day 05: Styling and Layout](../day-05-styling-and-layout/README.md).
- Comfortable with Flexbox, `StyleSheet.create`, `useState`, and `useMemo`.

## Introduction

On the web, you build UIs out of HTML tags like `<div>`, `<p>`, `<img>`, `<button>`, and `<input>`. React Native does not render HTML—it renders real native iOS (`UIKit`) and Android (`Android View`) widgets through a clean set of **Core Components**.

Learning these ~10 primitives deeply unlocks 90% of every mobile screen you will ever build. Just as important as knowing *how* each component works is knowing *when* to use it—for example, why rendering 500 items inside a `ScrollView` tanks performance while a `FlatList` keeps animations silky smooth.

## Concepts

### 1. `View` and `Text`

- **`View`**: The universal layout container (similar to `<div>` on the web, backed by `UIView` on iOS and `android.view.ViewGroup` on Android). It supports Flexbox, borders, backgrounds, accessibility roles, and shadows.
- **`Text`**: Every visible string in React Native **must** be wrapped inside `<Text>`. Putting raw text directly inside a `<View>` throws a runtime error. Useful props include `numberOfLines`, `ellipsizeMode`, `selectable`, and `accessibilityRole="header"`.

### 2. `Image` (and `expo-image`)

React Native's built-in `Image` displays both static local assets (`require('./logo.png')`) and remote URLs (`{ uri: 'https://...' }`).

- Remote images **require explicit `width` and `height`** in `style`; otherwise they render at `0 × 0` and appear invisible.
- Control cropping with `resizeMode`: `'cover'` (fill and crop), `'contain'` (fit completely), `'stretch'`, or `'center'`.
- **Production Tip (`expo-image`)**: For media-heavy feeds, avatars, and offline caching, Expo ships [`expo-image`](https://docs.expo.dev/versions/latest/sdk/image/), which adds automatic disk/memory caching, smooth crossfade transitions, SVG/WebP/AVIF support, and BlurHash/ThumbHash placeholders out of the box.

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

> **Important rule**: Never nest a vertical `FlatList` or `SectionList` inside a vertical `ScrollView`. Instead, put header content above the list using `FlatList`'s `ListHeaderComponent` prop (and footer content in `ListFooterComponent`). Horizontal `ScrollView` inside a vertical `FlatList` (like filter chips) is completely fine!

### 6. `Modal` and `ActivityIndicator`

- **`Modal`**: Renders native overlay dialogs and bottom sheets above the current screen.
  - Use `visible` (`boolean`), `transparent` (`boolean`), and `animationType` (`'none' | 'slide' | 'fade'`).
  - **Do NOT use the removed `animated` prop**—it was removed from modern React Native; always use `animationType`.
  - **Always provide `onRequestClose`**: Android requires this callback to handle the hardware/gesture Back button cleanly.
- **`ActivityIndicator`**: Displays the native spinning loader (`UIActivityIndicatorView` on iOS, `ProgressBar` on Android) with `size` (`'small' | 'large'`) and `color`.

## Code Examples

### Example 1: Interactive Core Components Gallery

See [`./examples/CoreComponentsGallery.tsx`](./examples/CoreComponentsGallery.tsx). It combines nearly every core component into one cohesive screen:

- `FlatList` with `ListHeaderComponent`, `ItemSeparatorComponent`, and `ListEmptyComponent`
- `TextInput` for live search filtering
- Horizontal `ScrollView` for category filter chips
- `Pressable` with `hitSlop` and pressed visual states
- `Image` thumbnails, `ActivityIndicator` sync state, and a slide-up `Modal`

### Example 2: Grouped Team Directory with `SectionList`

See [`./examples/ContactsSectionList.tsx`](./examples/ContactsSectionList.tsx) for a clean `SectionList` implementation featuring:

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

## Common Mistakes

1. **Putting raw text inside a `<View>`**
   - *Error*: `Text strings must be rendered within a <Text> component.`
   - *Fix*: Wrap every string (including conditional strings like `{count > 0 && 'New'}`—use ternary `{count > 0 ? <Text>New</Text> : null}` instead!) inside `<Text>`.
2. **Forgetting dimensions on remote `<Image>`**
   - *Why it fails*: Network images have unknown size before download, so React Native defaults them to `0 × 0`.
   - *Fix*: Always specify `width` and `height` (or `aspectRatio`) in the image style.
3. **Using `ScrollView` with `.map()` for large lists**
   - *Why it fails*: Mounts hundreds of native views simultaneously, causing slow screen transitions and high memory use.
   - *Fix*: Use `FlatList` or `SectionList`.
4. **Using `Modal`'s removed `animated` prop or omitting `onRequestClose`**
   - *Fix*: Use `animationType="slide"` (or `"fade"` / `"none"`) and always supply `onRequestClose`.
5. **Using `index` as `keyExtractor` in dynamic lists**
   - *Why it fails*: When items are filtered or reordered, React reuses the wrong row state.
   - *Fix*: Always return a stable unique ID like `item.id`.

## Best Practices

- **Prefer `Pressable` everywhere** over legacy `TouchableOpacity` or `TouchableHighlight`.
- **Use `ListEmptyComponent` and `ItemSeparatorComponent`** on `FlatList` and `SectionList` to keep empty states helpful and spacing consistent.
- **Upgrade to `expo-image`** when loading lots of remote photos, avatars, or gallery grids to benefit from native disk caching and smooth transitions.
- **Set `keyboardShouldPersistTaps="handled"`** on scrollable forms so tapping a button while the keyboard is open fires the button immediately instead of only dismissing the keyboard.
- **Always provide `accessibilityLabel`** on icon-only buttons, images, and search inputs.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and work inside [`./exercises/CatalogModalExercise.tsx`](./exercises/CatalogModalExercise.tsx):

1. **Beginner**: Wire up live case-insensitive `TextInput` search on the `FlatList` and add a helpful `ListEmptyComponent`.
2. **Intermediate**: Enhance each `Pressable` card with pressed-state styling and `hitSlop={6}`, and polish the detail `Modal` with bookmark and close actions.
3. **Challenge**: Complete the `"Bookmarks Only"` filter toggle, show a `"Saved"` pill on bookmarked rows, and wire up the `"Reload Catalog"` button with an `ActivityIndicator`.

## Solutions

Compare your completed exercise against [`./solutions/CatalogModalSolution.tsx`](./solutions/CatalogModalSolution.tsx).

Notice how the solution:
- Combines both `searchQuery` and `showBookmarksOnly` inside a single `useMemo` filter.
- Displays a dynamic result count (`X of Y lessons shown`) in the header.
- Guards `handleReload` against double taps while `isLoading` is `true`.

## Mini Project

**Quick Notes Drawer**: Build a single-screen Notes app using `FlatList`, `TextInput`, `Pressable`, and `Modal`. Include a `"+ New Note"` button that opens a `Modal` containing title and body `TextInput` fields, saves new notes into state, displays them in a `FlatList` with a `"Delete"` button on each row, and shows an empty-state callout when no notes exist.

## Key Takeaways

- React Native core components map directly to real native iOS and Android UI views.
- Use `ScrollView` for short fixed layouts, `FlatList` for long lists, and `SectionList` for grouped lists with section headers.
- `Pressable` replaces older touchable components with flexible pressed-state styling and `hitSlop`.
- Remote `Image` elements require explicit dimensions; reach for `expo-image` when you need production caching.
- Always configure `Modal` with `animationType` and `onRequestClose`.

## Further Reading

- [React Native Docs — Core Components and APIs](https://reactnative.dev/docs/components-and-apis)
- [React Native Docs — Pressable](https://reactnative.dev/docs/pressable)
- [React Native Docs — FlatList](https://reactnative.dev/docs/flatlist)
- [React Native Docs — SectionList](https://reactnative.dev/docs/sectionlist)
- [React Native Docs — Modal](https://reactnative.dev/docs/modal)
- [Expo Docs — `expo-image`](https://docs.expo.dev/versions/latest/sdk/image/)

## Progress Checklist

- [ ] Understood when to choose `ScrollView`, `FlatList`, and `SectionList`
- [ ] Studied `examples/CoreComponentsGallery.tsx` and `examples/ContactsSectionList.tsx`
- [ ] Completed the Beginner, Intermediate, and Challenge tasks in `exercises/CatalogModalExercise.tsx`
- [ ] Verified TypeScript (`npm run typecheck`) and ESLint (`npm run lint`) pass
- [ ] Tested keyboard behavior, search filtering, and modal dismissal on simulator or device

## Next Day

You now have every foundation needed for Week 1! Put everything together in [Day 07: Build Your First Mobile App](../day-07-first-mobile-app/README.md).
