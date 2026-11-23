# Day 15 Exercises: Animations

Practice building smooth, accessible animations that run on the UI thread without causing layout thrashing.

## How to Practise

1. Open [`ExpandableCardExercise.tsx`](./ExpandableCardExercise.tsx). It already compiles cleanly with TypeScript and ESLint—replace each `// TODO:` step in order (Beginner → Intermediate → Challenge).
2. Preview your card in your Expo playground app (or via `npm start` in this repository's shared Expo launcher).
   - **RN 0.88 + Reanimated 3 TypeScript tip**: If you hit a `TS2589` recursive type instantiation error when passing an array style to `Animated.View` or `Animated.Text`, use the small flat-style `Animated.createAnimatedComponent` helper shown in [`../README.md`](../README.md) and [`../examples/DraggableCard.tsx`](../examples/DraggableCard.tsx).
3. Verify your work from the repository root:

```bash
npm run typecheck
npm run lint
```

---

## Beginner — Rotating Chevron Indicator

### Requirements
- Create a shared value `progress = useSharedValue(initialExpanded ? 1 : 0)`.
- Inside `handleToggle`, update `progress.value` using `withTiming(nextExpanded ? 1 : 0, { duration: 220 })`.
- Create `chevronAnimatedStyle` with `useAnimatedStyle` returning `{ transform: [{ rotate: `${progress.value * 180}deg` }] }`.
- Render a single chevron (`▼`) inside an animated `Text` component with `[styles.chevron, chevronAnimatedStyle]` instead of swapping between `'▲'` and `'▼'`.

### Acceptance Criteria
- [ ] Clicking the card header rotates the `▼` smoothly from `0deg` to `180deg` over 220ms and back when collapsed.
- [ ] Respects `initialExpanded={true}` by starting rotated at `180deg` without an awkward initial spin on mount.
- [ ] Zero React re-renders occur per frame during the rotation.

### Expected Behavior
Tapping the header toggles the details section while the chevron smoothly rotates half a turn on the UI thread.

<details>
<summary>Hint</summary>

Specify the return type explicitly on `useAnimatedStyle<TextStyle>` for crisp strict TypeScript checking:

```tsx
const chevronAnimatedStyle: TextStyle = useAnimatedStyle<TextStyle>(() => ({
  transform: [{ rotate: `${progress.value * 180}deg` }],
}));
```

</details>

---

## Intermediate — Animated Content Reveal & Spring Press Feedback

### Requirements
- Add a second shared value `cardScale = useSharedValue(1)` and a `cardAnimatedStyle` applying `{ transform: [{ scale: cardScale.value }] }` to the outer animated card container.
- Wire `onPressIn` (`cardScale.value = withTiming(0.985, { duration: 100 })`) and `onPressOut` (`cardScale.value = withSpring(1, { damping: 14, stiffness: 220 })`) onto the header `Pressable`.
- Animate the expanded details body using **only GPU-friendly properties** (`opacity` and `translateY` derived from `progress.value`) combined with Reanimated layout transitions (`entering={FadeIn.duration(180)}` and `exiting={FadeOut.duration(140)}`).

### Acceptance Criteria
- [ ] Pressing and holding the header subtly compresses the card (`0.985`), and releasing pops it back with spring physics.
- [ ] Expanding/collapsing smoothly fades and glides the body without animating `height` or `padding`.
- [ ] Fast repeated taps interrupt cleanly without getting stuck mid-animation.

### Expected Behavior
The card responds physically to finger press/release and reveals its detail copy with a soft fade-and-glide transition.

<details>
<summary>Hint</summary>

Derive both `opacity` and a subtle upward slide from `progress.value`:

```tsx
const bodyAnimatedStyle: ViewStyle = useAnimatedStyle<ViewStyle>(() => ({
  opacity: progress.value,
  transform: [{ translateY: (1 - progress.value) * -6 }],
}));
```

</details>

---

## Challenge — Respect Reduced Motion & Accessibility

### Requirements
- Call `const reducedMotion = useReducedMotion()` from `'react-native-reanimated'`.
- When `reducedMotion` is `true`:
  - Skip the `onPressIn` / `onPressOut` scale bounce.
  - Set `progress.value = nextExpanded ? 1 : 0` immediately instead of calling `withTiming(...)`.
  - Disable `translateY` shift (`0`) and pass `undefined` to `entering` and `exiting` on the body container.
- Ensure the header `Pressable` includes `accessibilityRole="button"`, `accessibilityState={{ expanded }}`, and a helpful `accessibilityHint` (`expanded ? 'Collapses card details' : 'Expands card details'`).

### Acceptance Criteria
- [ ] Enabling **Reduce Motion** (iOS Accessibility settings) or **Remove Animations** (Android Developer / Accessibility settings) switches the card to crisp, immediate transitions with zero bounce or slide.
- [ ] Screen readers announce the card's current expanded/collapsed state and hint accurately.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors or warnings.

### Expected Behavior
Users with motion sensitivity still see clear expanded/collapsed state changes and rotated chevron orientation without any vestibular-triggering motion.

<details>
<summary>Hint</summary>

Condition every transition cleanly on `reducedMotion`:

```tsx
progress.value = reducedMotion ? target : withTiming(target, { duration: 220 });
```

And on the details container:

```tsx
<ReanimatedView
  entering={reducedMotion ? undefined : FadeIn.duration(180)}
  exiting={reducedMotion ? undefined : FadeOut.duration(140)}
  style={[styles.body, bodyAnimatedStyle]}
>
```

</details>

---

## Reference Solution

<details>
<summary>Only after trying — view reference solution</summary>

Compare your completed component against [`../solutions/ExpandableCardSolution.tsx`](../solutions/ExpandableCardSolution.tsx), then run:

```bash
npm run typecheck
npm run lint
```

</details>
