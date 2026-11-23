# Day 15 Exercises: Animations

Practice building smooth, accessible animations that run on the UI thread without causing layout thrashing.

## Setup

Open [`ExpandableCardExercise.tsx`](./ExpandableCardExercise.tsx). It already compiles cleanly with TypeScript and ESLint. Replace each `// TODO:` step with your implementation.

## Tasks

### Exercise 1 (Beginner): Rotating Chevron Indicator
- Create a shared value `progress` (`0` when collapsed, `1` when expanded) using `useSharedValue`.
- Toggle `expanded` when the header `Pressable` is pressed and animate `progress` using `withTiming` (220ms).
- Rotate the chevron icon from `0deg` to `180deg` using `useAnimatedStyle`.

### Exercise 2 (Intermediate): Animated Content Reveal
- Animate the body container's `opacity` and `translateY` when expanding/collapsing.
- Use Reanimated layout transitions (`FadeIn` / `FadeOut`) or shared value transforms so you animate GPU-friendly properties (`transform` and `opacity`) rather than recalculating layout every frame.
- Add subtle spring press feedback (`scale: 0.98` on press-in, `withSpring(1)` on press-out).

### Exercise 3 (Challenge): Respect Reduced Motion
- Call `useReducedMotion()` from `react-native-reanimated`.
- When reduced motion is enabled, update `progress` immediately without spring/timing animations and skip entering/exiting transitions.
- Add appropriate `accessibilityState={{ expanded }}` and `accessibilityRole="button"` props to the header trigger.

## Verification

Compare your implementation with [`../solutions/ExpandableCardSolution.tsx`](../solutions/ExpandableCardSolution.tsx) and verify:

```bash
npm run typecheck
npm run lint
```
