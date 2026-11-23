# Day 22 Exercises: Accessibility

Open [`AccessibleToggleExercise.tsx`](./AccessibleToggleExercise.tsx) and work through the three tiers below.

## 1. Beginner — Core Semantics, Touch Targets, and Contrast
1. Add `accessible={true}`, `accessibilityRole="switch"`, `accessibilityLabel`, `accessibilityHint`, and `accessibilityState={{ checked: enabled, disabled }}` to the `Pressable`.
2. Hide the decorative `ON` / `OFF` pill from screen readers using `accessible={false}`, `importantForAccessibility="no-hide-descendants"`, and `accessibilityElementsHidden={true}`.
3. Increase `styles.card.minHeight` to at least `56` (exceeding both the 44pt iOS and 48dp Android minimums).
4. Replace the low-contrast `#CBD5E1` description text color with a WCAG AA-compliant color such as `#475569`.

## 2. Intermediate — Font Scaling and Live Announcements
1. Explicitly enable `allowFontScaling={true}` and set `maxFontSizeMultiplier={2}` on the title and description `Text` nodes so Dynamic Type scales comfortably without breaking the layout.
2. Announce toggle changes politely:
   - Render a visually hidden live region (`accessibilityLiveRegion="polite"`) for Android.
   - Call `AccessibilityInfo.announceForAccessibility(...)` on iOS when the user toggles the switch.

## 3. Challenge — Respecting Reduced Motion
1. Extract a `useReducedMotion()` hook that queries `AccessibilityInfo.isReduceMotionEnabled()` and subscribes to `reduceMotionChanged` (cleaning up the subscription on unmount).
2. Apply a subtle press scale (`transform: [{ scale: 0.99 }]`) only when reduced motion is **off**; when reduced motion is **on**, provide a static background color highlight instead.
3. Write a React Native Testing Library test verifying `getByRole('switch')`, `accessibilityState.checked`, and `onToggle` invocation.

## Reference Solution
Compare your work against [`../solutions/AccessibleToggleSolution.tsx`](../solutions/AccessibleToggleSolution.tsx).
