# Day 22 Exercises: Accessibility

## How to Practise

1. Open the starter component [`AccessibleToggleExercise.tsx`](./AccessibleToggleExercise.tsx) and inspect its existing accessibility bugs listed in the file header comment.
2. Fix the component tier by tier (**Beginner → Intermediate → Challenge**).
3. After each change, verify strict TypeScript and ESLint from the repository root:

```bash
npm run typecheck
npm run lint
```

4. Render `AccessibleToggleExercise` inside a screen in your Expo app (or preview in the shared Expo launcher via `npm start`) and test it with **Xcode Accessibility Inspector / VoiceOver** (iOS) or **TalkBack** (Android) plus **200% system font scaling**.

---

## 1. Beginner — Core Semantics, Touch Targets, and Contrast

### Requirements

1. On the outer `Pressable`, add:
   - `accessible={true}`
   - `accessibilityRole="switch"`
   - `accessibilityLabel` combining `title` and `description` (e.g., `` `${title}. ${description}` ``)
   - `accessibilityHint` describing what toggling will do
   - `accessibilityState={{ checked: enabled, disabled }}`
2. Hide the decorative `ON` / `OFF` pill `<View>` from screen readers using `accessible={false}`, `importantForAccessibility="no-hide-descendants"`, and `accessibilityElementsHidden={true}`.
3. Increase `styles.card.minHeight` from `36` to at least `56` (comfortably exceeding both the 44pt iOS and 48dp Android minimums).
4. Replace the low-contrast `#CBD5E1` description color (~1.5:1 on white) with a WCAG AA-compliant color such as `#475569` (~7.6:1 on white).

### Acceptance Criteria

- [ ] Swiping in VoiceOver / TalkBack focuses the entire card as one `switch` stop (not separate stops for title, description, and `ON`/`OFF`).
- [ ] `accessibilityState` accurately reflects both `checked: enabled` and `disabled`.
- [ ] Card height is at least `56` logical pixels and never clips text.
- [ ] Description text meets WCAG AA contrast (≥ 4.5:1 against `#FFFFFF`).

### Expected Behavior

Focusing the card with a screen reader announces the title, description, role (`switch`), current on/off state, and hint in one clean stop, without redundantly reading `"ON"` or `"OFF"` afterward.

<details>
<summary>Hint</summary>

Check [`../examples/AccessibleSettingsRow.tsx`](../examples/AccessibleSettingsRow.tsx) for the exact grouping pattern: put `accessible={true}` and `accessibilityRole="switch"` on `Pressable`, and place `accessible={false}`, `importantForAccessibility="no-hide-descendants"`, and `accessibilityElementsHidden={true}` on the inner decorative status pill.

</details>

---

## 2. Intermediate — Font Scaling and Live Announcements

### Requirements

1. Explicitly enable `allowFontScaling={true}` and set `maxFontSizeMultiplier={2}` on the `title` and `description` `<Text>` nodes (and `maxFontSizeMultiplier={1.5}` on the compact pill text).
2. Store a `liveStatus` string in component state and update it on toggle (e.g., `` `${title} turned ${nextEnabled ? 'on' : 'off'}` ``).
3. Render a visually hidden `<Text accessibilityLiveRegion="polite">` when `liveStatus.length > 0` so Android TalkBack speaks the update politely without moving focus.
4. On iOS (`Platform.OS === 'ios'`), call `AccessibilityInfo.announceForAccessibility(announcement)` inside `handlePress`.

### Acceptance Criteria

- [ ] Increasing system font size to 200% enlarges both title and description cleanly without clipping or overlapping the status pill.
- [ ] Toggling the card triggers a polite spoken announcement on both Android (`accessibilityLiveRegion="polite"`) and iOS (`AccessibilityInfo.announceForAccessibility`).
- [ ] Pressing a disabled card neither invokes `onToggle` nor announces a state change.

### Expected Behavior

Tapping **"High Contrast Mode"** when off announces *"High Contrast Mode turned on"* while keeping screen-reader focus right on the card.

<details>
<summary>Hint</summary>

Position the Android live region off-visual layout without using `display: 'none'` (which hides it from TalkBack too!):

```ts
srOnly: {
  position: 'absolute',
  width: 1,
  height: 1,
  opacity: 0,
}
```

</details>

---

## 3. Challenge — Respecting Reduced Motion & Automated Testing

### Requirements

1. Extract a reusable `useReducedMotion()` hook that:
   - Reads the initial setting via `AccessibilityInfo.isReduceMotionEnabled()`.
   - Subscribes to `AccessibilityInfo.addEventListener('reduceMotionChanged', ...)`.
   - Cleans up the subscription (`subscription.remove()`) and guards unmounted state updates on unmount.
2. Update the `Pressable` `style` callback so pressing applies `transform: [{ scale: 0.99 }]` **only** when `reduceMotion` is `false`; when `reduceMotion` is `true`, apply a static background color highlight instead.
3. Write a React Native Testing Library test verifying:
   - `screen.getByRole('switch', { name: /.../i })` finds the control,
   - `accessibilityState` matches `{ checked: false, disabled: false }`,
   - `fireEvent.press(...)` invokes `onToggle(true)`.

### Acceptance Criteria

- [ ] `useReducedMotion()` cleans up its event listener on unmount with zero memory leaks or act warnings.
- [ ] Enabling **Reduce Motion** in iOS/Android settings removes the scale transform while preserving clear visual press feedback.
- [ ] Your RNTL test passes using semantic queries (`getByRole`) without relying on `getByTestId`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior

Users with standard motion settings feel a subtle scale press animation; users with OS Reduce Motion enabled see an instant, comfortable color tint with zero motion—and CI verifies the accessible switch contract automatically.

<details>
<summary>Hint</summary>

Wrap the initial `AccessibilityInfo.isReduceMotionEnabled().then(...)` inside a `let active = true;` guard in `useEffect`, catch errors gracefully (helpful in Jest environments), and return `() => { active = false; subscription.remove(); }` from the effect cleanup.

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to view the reference solution link</summary>

Once you have completed your implementation, compare your work against [`../solutions/AccessibleToggleSolution.tsx`](../solutions/AccessibleToggleSolution.tsx).

</details>
