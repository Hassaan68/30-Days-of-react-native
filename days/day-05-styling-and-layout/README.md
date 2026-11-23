# Day 05: Styling and Layout

## Learning Objectives

By the end of Day 05, you will be able to:

- Style React Native components cleanly using `StyleSheet.create` and reusable design tokens.
- Lay out mobile interfaces with Flexbox, understanding React Native's mobile-first defaults (`flexDirection: 'column'`, unitless numbers, `gap`, `flex`).
- Build responsive screens that adapt to different phone sizes, orientations, and tablets using `useWindowDimensions` and breakpoints.
- Write platform-specific styles using `Platform.select` (including iOS shadows vs. Android `elevation`).
- Handle notches, Dynamic Islands, status bars, and home indicators properly with `react-native-safe-area-context`.
- Support accessible typography scaling and automatic Light/Dark themes with `useColorScheme`.

## Prerequisites

- Completed [Day 03: React Fundamentals](../day-03-react-fundamentals/README.md) and [Day 04: React Hooks](../day-04-react-hooks/README.md).
- Comfortable creating typed functional components with `useState`.
- Familiarity with basic CSS box model concepts (padding, margin, border) is helpful, though we explain every React Native difference from scratch.

## Why This Concept Matters

Mobile devices come in dozens of screen sizes, notch cutouts, pixel densities, orientations, and user-selected font scales—and most users expect crisp Light and Dark Mode support out of the box. Knowing React Native's Flexbox defaults, responsive `useWindowDimensions` breakpoints, semantic design tokens, platform-specific shadows, and `react-native-safe-area-context` ensures your UI looks polished and native on every iPhone, Android phone, foldable, and tablet.

## Introduction

If you have styled web applications before, React Native styling will feel familiar yet subtly different. There are no `.css` files, no CSS cascade, and no pixel (`px`) or `rem` units. Instead, every component accepts a `style` prop powered by JavaScript objects and a fast native layout engine called **Yoga** (which implements Flexbox).

On mobile, screens vary dramatically: compact iPhones, tall Android phones with camera cutouts, foldables, and tablets in landscape mode. Users also switch between Light Mode and Dark Mode and adjust their system font sizes for readability. Today, you will learn how to build resilient, polished layouts that look native on both iOS and Android without fragile hardcoded pixel math.

## Concepts

### 1. `StyleSheet.create` and Unitless Dimensions

In React Native, you define styles with `StyleSheet.create(...)` at the bottom of your component file (or in a shared style module).

- **CamelCase properties**: `background-color` becomes `backgroundColor`, `border-radius` becomes `borderRadius`.
- **Unitless numbers**: `padding: 16` means 16 density-independent pixels (`dp` on Android, `pt` on iOS). React Native automatically scales these across 1x, 2x, and 3x screens so buttons remain physically comfortable to tap on every phone.
- **No inheritance (except nested `<Text>`)**: Setting `color` on a `<View>` does *not* style child `<Text>` elements. Always apply text styles directly to `<Text>`.
- **Style arrays**: Pass an array to combine base styles with conditional or theme overrides: `style={[styles.card, isSelected && styles.cardSelected]}`.

### 2. Flexbox & CSS (Web) vs. React Native Styles

Flexbox (powered by the native Yoga engine) is the primary layout system in React Native. If you have written web CSS before, keep this side-by-side comparison handy—it prevents 90% of early layout surprises:

| Feature / Property | CSS (Web) | React Native Styles |
| --- | --- | --- |
| **Syntax & location** | `.css` files, `kebab-case`, `className` | `StyleSheet.create(...)`, `camelCase` JS objects, `style` prop |
| **Units** | `px`, `rem`, `em`, `vh` / `vw` | **Unitless numbers** (`dp` on Android, `pt` on iOS) or `%` strings |
| **Style cascading** | Styles inherit down the DOM tree | **No cascading** (except nested `<Text>` inside `<Text>`) |
| **Shadows** | `box-shadow` across all browsers | **iOS:** `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`; **Android:** `elevation` |
| **`flexDirection` default** | `'row'` | **`'column'`** (stacks vertically by default) |
| **`alignContent` default** | `'stretch'` | `'flex-start'` |
| **`flexShrink` default** | `1` | `0` |
| **`flex` property** | Shorthand (`grow shrink basis`) | Single number (ratio of available space) |

Key Flexbox properties you will use daily:

- `flexDirection`: `'column'` (vertical stack, default) or `'row'` (horizontal row).
- `justifyContent`: aligns children along the **main axis** (`'flex-start'`, `'center'`, `'flex-end'`, `'space-between'`, `'space-around'`, `'space-evenly'`).
- `alignItems`: aligns children along the **cross axis** (`'stretch'`, `'flex-start'`, `'center'`, `'flex-end'`).
- `flex: 1`: tells a view to expand and fill the remaining space inside its parent.
- `gap`, `rowGap`, `columnGap`: clean spacing between flex children without awkward margin hacks.

### 3. Responsive Layouts with `useWindowDimensions`

Avoid hardcoding screen widths like `width: 390`. Instead, use the `useWindowDimensions()` hook from `react-native`:

```tsx
const { width, height, fontScale } = useWindowDimensions();
```

Unlike `Dimensions.get('window')` (which is a one-time snapshot and does not re-render when the user rotates their device or resizes a tablet split-screen), `useWindowDimensions()` automatically triggers a re-render whenever dimensions change.

You can map `width` to simple breakpoints:

- **Compact (`< 600`)**: single-column phone layout.
- **Medium (`600 – 899`)**: large phones in landscape or small tablets (2 columns).
- **Expanded (`>= 900`)**: large tablets or web desktop (3–4 columns).

### 4. Platform-Specific Styles (`Platform.select`)

iOS and Android have different visual conventions. The most famous example is **shadows**:

- **iOS** uses `shadowColor`, `shadowOffset`, `shadowOpacity`, and `shadowRadius`.
- **Android** uses a single `elevation` number (which casts a Material Design shadow).

`Platform.select` keeps platform differences clean and readable:

```tsx
const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  android: {
    elevation: 4,
  },
  default: {},
});
```

### 5. Safe Areas (`react-native-safe-area-context`)

Modern phones have status bars, camera notches, Dynamic Islands, and bottom home gesture indicators. If you render content at `y = 0`, it will collide with system UI.

> **Important (React Native 0.88 / Expo SDK 58):** The built-in `SafeAreaView` exported from `react-native` is **deprecated** and only worked inconsistently on iOS. **Always** import `SafeAreaProvider`, `SafeAreaView`, and `useSafeAreaInsets` from `react-native-safe-area-context`.

1. Wrap the root of your app in `<SafeAreaProvider>`.
2. Use `<SafeAreaView edges={['top', 'left', 'right']}>` for standard screen padding.
3. Use `useSafeAreaInsets()` when you need exact pixel numbers (for example, adding bottom padding inside a `ScrollView`'s `contentContainerStyle` so scrollable content slides cleanly behind the home indicator).

### 6. Reusable Design Tokens, Typography & Dark Mode

Hardcoding hex colors like `#2563EB` and random numbers like `13` and `17` across 20 screens makes redesigns painful. Instead, centralize:

- **Spacing scale**: `xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32`
- **Border radii**: `sm: 6, md: 12, lg: 18, pill: 999`
- **Typography presets**: consistent `fontSize`, `lineHeight`, and `fontWeight`
- **Light & Dark color palettes**: selected dynamically with React Native's `useColorScheme()` hook (`'light' | 'dark' | null`).

For accessibility, let `<Text>` scale with system font preferences by default (`allowFontScaling` is `true`). When a banner or button has tight space, prefer `maxFontSizeMultiplier={1.6}` instead of disabling scaling completely.

## Code Examples

- **Preview immediately:** Run `npm start` from the repository root to open the shared Expo launcher and test `ResponsiveLayoutScreen` live—rotate your simulator or toggle Light/Dark Mode to watch the layout adapt in real time.

### Example 1: Reusable Design Tokens & Theme Helpers

- **File:** [`./examples/ThemeTokens.ts`](./examples/ThemeTokens.ts) *(reusable TypeScript theme/helper module)*
- **Where to place in an Expo project:** Put shared design tokens in `theme/ThemeTokens.ts` (or `src/theme/tokens.ts`) so every screen and component imports the same spacing, radii, typography, colors, and shadows.

See [`./examples/ThemeTokens.ts`](./examples/ThemeTokens.ts) for a complete, strictly typed token system including spacing, radii, typography presets, light/dark color palettes, breakpoint detection, and cross-platform shadows.

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export function getBreakpoint(width: number): 'compact' | 'medium' | 'expanded' {
  if (width >= 900) return 'expanded';
  if (width >= 600) return 'medium';
  return 'compact';
}
```

### Example 2: Responsive, Theme-Aware Dashboard Screen

- **File:** [`./examples/ResponsiveLayoutScreen.tsx`](./examples/ResponsiveLayoutScreen.tsx) *(runnable interactive screen component)*
- **Where to place in an Expo project:** Drop it in `app/index.tsx` (or `screens/ResponsiveLayoutScreen.tsx` imported by a route), with `ThemeTokens.ts` alongside or in `theme/`.

See [`./examples/ResponsiveLayoutScreen.tsx`](./examples/ResponsiveLayoutScreen.tsx) for a full runnable screen combining:

- `SafeAreaProvider`, `SafeAreaView`, and `useSafeAreaInsets` from `react-native-safe-area-context`
- `useWindowDimensions` to compute 1, 2, or 4 grid columns dynamically
- `useColorScheme` with an interactive Light/Dark toggle override
- `Platform.select` shadows and `maxFontSizeMultiplier` typography scaling

## Step-by-Step Explanation

Let's walk through how [`ResponsiveLayoutScreen.tsx`](./examples/ResponsiveLayoutScreen.tsx) fits together:

1. **Wrap with `SafeAreaProvider`**: The default export renders `<SafeAreaProvider>` at the top level so `SafeAreaView` and `useSafeAreaInsets()` can measure exact device insets on both iOS and Android.
2. **Read Dynamic Environment Hooks**: Inside `ResponsiveDashboardContent`, we call `useColorScheme()`, `useWindowDimensions()`, and `useSafeAreaInsets()`. Whenever the user rotates their phone or toggles Dark Mode in system settings, React automatically re-renders with updated values.
3. **Resolve Theme and Breakpoint**: `getThemeColors(activeMode)` returns the appropriate semantic palette (`background`, `surface`, `textPrimary`, `border`, `primary`), while `getBreakpoint(width)` picks `'compact'`, `'medium'`, or `'expanded'`.
4. **Calculate Responsive Card Widths**: Using the screen width minus horizontal padding and gaps (`(width - horizontalPadding - totalGap) / columns`), each card fits neatly inside the `flexWrap: 'wrap'` grid without overflowing.
5. **Apply Safe Bottom Scroll Padding**: Instead of clipping scroll content above the home indicator, `<SafeAreaView edges={['top', 'left', 'right']}>` handles the top and sides, while `ScrollView`'s `contentContainerStyle` applies `paddingBottom: Math.max(insets.bottom, spacing.lg)`.

## Expected Output

On a standard portrait phone (`width < 600 dp`, `compact` breakpoint), `ResponsiveLayoutScreen` renders a single-column scrollable dashboard safely below the status bar / Dynamic Island:

```text
+--------------------------------------------+
| Layout & Styling           [ Dark Mode ]   |
| 390 x 844 dp • compact • ios               |
|                                            |
| +----------------------------------------+ |
| | Adaptive Flexbox Grid                  | |
| | Rotate the simulator or resize the     | |
| | window... Current font scale: 1.00x.   | |
| +----------------------------------------+ |
|                                            |
| +----------------------------------------+ |
| | Lessons Completed                      | |
| | 5 / 30                                 | |
| | [ +1 today ]                           | |
| +----------------------------------------+ |
| +----------------------------------------+ |
| | Active Streak                          | |
| | 5 days                                 | |
| | [ Personal best ]                      | |
| +----------------------------------------+ |
|                                            |
| Safe Area Insets — top: 59px, bottom: 34px |
+--------------------------------------------+
```

- Rotating to landscape (`width >= 600 dp`, `medium`) automatically rearranges the 4 metric cards into a **2-column** grid; on wide tablets or desktop web (`width >= 900 dp`, `expanded`) all **4 cards** sit in a single horizontal row.
- Tapping **Dark Mode / Light Mode** instantly switches the background, card surfaces, borders, text, and shadows between the light and dark palettes.

## Common Mistakes

1. **Importing `SafeAreaView` from `react-native`**
   - *Why it breaks*: It is deprecated in modern React Native and does not handle Android cutouts reliably.
   - *Fix*: Always import from `react-native-safe-area-context`.
2. **Expecting `flexDirection: 'row'` by default**
   - *Why it breaks*: Developers coming from web CSS wonder why child views stack vertically.
   - *Fix*: Explicitly add `flexDirection: 'row'` whenever placing items side-by-side.
3. **Using `Dimensions.get('window')` outside a component for responsive UI**
   - *Why it breaks*: Module-level `Dimensions.get('window')` never updates on rotation, foldable unfold, or web window resize.
   - *Fix*: Use the `useWindowDimensions()` hook inside your component.
4. **Putting `shadowOpacity` on Android and wondering why no shadow appears**
   - *Why it breaks*: Android ignores iOS `shadow*` props and requires `elevation` (and a non-transparent `backgroundColor`).
   - *Fix*: Use `Platform.select` to provide iOS shadow properties and Android `elevation`.
5. **Creating large inline style objects on every render**
   - *Why it breaks*: Hurts readability and allocates unnecessary objects inside hot render paths (like list items).
   - *Fix*: Keep static styles inside `StyleSheet.create` and only pass dynamic theme/dimension overrides inline.

## Best Practices

- **Use semantic color names**: Name tokens `surface`, `textPrimary`, and `border` instead of `white` or `gray200` so Dark Mode swaps effortlessly.
- **Prefer `gap` over child margins**: Flexbox `gap` keeps spacing symmetrical and prevents extra trailing space on the last item.
- **Design for font scaling**: Never lock fixed `height` on containers holding multi-line `<Text>`. Use `minHeight` and `paddingVertical` instead so large accessibility text does not clip.
- **Test both orientations and themes**: Regularly toggle Dark Mode (`Cmd + Shift + A` in iOS Simulator) and rotate the simulator (`Cmd + Right Arrow`) while building screens.
- **Keep a single root `SafeAreaProvider`**: Place `<SafeAreaProvider>` once at your app's root layout (`app/_layout.tsx` once you start using Expo Router on Day 08).

## Exercises

Head to [`./exercises/README.md`](./exercises/README.md) and open [`./exercises/PricingCardExercise.tsx`](./exercises/PricingCardExercise.tsx) to build a responsive Pricing Plan screen.

1. **Beginner**: Style the plan card with `StyleSheet.create`, render each feature item in a clean horizontal Flexbox row, and display a `"Most Popular"` badge for recommended plans.
2. **Intermediate**: Add Light and Dark Mode support with `useColorScheme`, cross-platform shadows with `Platform.select`, and safe area wrapping with `react-native-safe-area-context`.
3. **Challenge**: Make the cards switch between stacked (1 column) and side-by-side (2 columns) at `width >= 700` using `useWindowDimensions`, and implement a working Monthly/Annual billing toggle with a 20% annual discount.

## Solutions

Try styling and testing `PricingCardExercise.tsx` on both narrow and wide viewports before opening the reference notes below.

<details>
<summary>Click to view solution notes &amp; links</summary>

- [`./solutions/PricingCardSolution.tsx`](./solutions/PricingCardSolution.tsx): Complete responsive, Light/Dark theme-aware pricing screen with cross-platform shadows, safe area handling, and Monthly/Annual billing toggle.
- **Key highlights to compare:**
  - Semantic `LIGHT_THEME` and `DARK_THEME` palettes ensure strong contrast in both modes.
  - `getCardElevation(isDark)` encapsulates `Platform.select` cleanly with typed `ViewStyle`.
  - `maxWidth: 960` paired with `alignSelf: 'center'` prevents cards from stretching awkwardly on ultra-wide tablets.
  - `accessibilityState={{ selected }}` communicates toggle and plan selection state to screen readers.

</details>

## Mini Project

**Adaptive Theme Studio**: Extend `ResponsiveLayoutScreen.tsx` by adding a "Compact / Comfortable" density toggle that switches card padding between `spacing.md` and `spacing.xl`, and add a 3-button theme selector (`System`, `Light`, `Dark`). Verify that rotating the device updates the displayed dimensions and column count smoothly.

## Key Takeaways

- React Native styles use JavaScript objects via `StyleSheet.create`, unitless density-independent numbers, and Flexbox with `flexDirection: 'column'` by default.
- Use `useWindowDimensions()` instead of static `Dimensions.get()` for responsive layouts.
- Always use `react-native-safe-area-context` (`SafeAreaProvider`, `SafeAreaView`, `useSafeAreaInsets`) instead of the deprecated `SafeAreaView` from `react-native`.
- Combine semantic design tokens with `useColorScheme()` and `Platform.select()` to deliver native-feeling Light/Dark experiences on both iOS and Android.

## Further Reading

- [React Native Docs — Style](https://reactnative.dev/docs/style)
- [React Native Docs — Layout with Flexbox](https://reactnative.dev/docs/flexbox)
- [React Native Docs — useWindowDimensions](https://reactnative.dev/docs/usewindowdimensions)
- [React Native Docs — useColorScheme](https://reactnative.dev/docs/usecolorscheme)
- [Expo Docs — Safe Areas (`react-native-safe-area-context`)](https://docs.expo.dev/develop/user-interface/safe-areas/)

## Progress Checklist

- [ ] Read all styling, Flexbox, safe area, and theming concepts
- [ ] Reviewed `examples/ThemeTokens.ts` and `examples/ResponsiveLayoutScreen.tsx`
- [ ] Completed the Beginner, Intermediate, and Challenge tasks in `exercises/PricingCardExercise.tsx`
- [ ] Verified TypeScript (`npm run typecheck`) and ESLint (`npm run lint`) pass
- [ ] Tested Light Mode, Dark Mode, and portrait/landscape layouts

## Next Day

Ready to master the building blocks of every React Native screen? Continue to [Day 06: Core React Native Components](../day-06-core-components/README.md).
