# Day 05 Exercises: Styling and Layout

Practice building responsive, theme-aware, cross-platform layouts using `StyleSheet.create`, Flexbox, `useWindowDimensions`, `useColorScheme`, `Platform.select`, and `react-native-safe-area-context`.

## Starter File

Open [`./PricingCardExercise.tsx`](./PricingCardExercise.tsx). The starter file compiles cleanly with TypeScript and ESLint, and marks each task with `// TODO:` comments.

## Tasks

### Exercise 1 (Beginner): Style the Plan Card with Design Tokens
1. Replace the placeholder container styling with a clean card layout using `StyleSheet.create`.
2. Render the plan `title`, `pricePerMonth`, `description`, and every feature row using Flexbox (`flexDirection: 'row'`, `alignItems: 'center'`, `gap`).
3. Highlight the `isRecommended` plan with a pill badge (`"Most Popular"`) and a distinct border color.

### Exercise 2 (Intermediate): Support Light/Dark Themes & Platform Shadows
1. Use `useColorScheme()` to adapt background, card surface, border, and text colors for light and dark mode.
2. Add platform-specific card elevation using `Platform.select` (`shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` on iOS, `elevation` on Android).
3. Wrap the screen in `SafeAreaProvider` and `SafeAreaView` from `react-native-safe-area-context` (never from `react-native`).

### Exercise 3 (Challenge): Responsive Two-Column Layout & Billing Toggle
1. Use `useWindowDimensions()` to stack cards vertically on narrow screens (`width < 700`) and render them side-by-side (`flexDirection: 'row'`) on wider screens (`width >= 700`).
2. Add a Monthly / Annual billing toggle (`Pressable`) that applies a 20% discount to annual pricing and visually highlights the active toggle option.
3. Track the currently selected plan in state and show visual feedback on the selected card's action button.

## Verification Checklist

- [ ] No `SafeAreaView` imported from `react-native`
- [ ] Cards stack on phones and display side-by-side on tablets/landscape (`width >= 700`)
- [ ] Light and dark mode both maintain strong readable text contrast
- [ ] Annual toggle updates displayed prices accurately
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors

Compare your finished work with [`../solutions/PricingCardSolution.tsx`](../solutions/PricingCardSolution.tsx).
