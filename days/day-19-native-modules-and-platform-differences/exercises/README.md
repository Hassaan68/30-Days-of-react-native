# Day 19 Exercises: Platform Differences & Native Adaptation

Practice writing components that look and feel native on both iOS and Android without duplicating entire screens.

## How to Practise

1. Open the starter file [`PlatformCardExercise.tsx`](./PlatformCardExercise.tsx) and review the four `TODO` comments.
2. Complete each exercise level directly in `PlatformCardExercise.tsx` (and create the optional platform-specific haptics helpers for the Challenge).
3. Validate your TypeScript types and code style after each step:
   ```bash
   npm run typecheck
   npm run lint
   ```
4. Preview your card on both platforms via this repository's shared Expo launcher (`npm start`, then press `i` for iOS Simulator and `a` for Android Emulator) and toggle Dark Mode in simulator settings to verify every visual detail.

---

## Exercise 1 (Beginner): Platform Badge Label

### Requirements

- Update `getPlatformBadgeText()` to use `Platform.select` instead of returning raw `Platform.OS`.
- Return `'iOS Native'` on iOS, `'Android Material'` on Android, and `'Cross-Platform'` as the `default` fallback.

### Acceptance Criteria

- [ ] `getPlatformBadgeText()` uses `Platform.select({ ios, android, default })`.
- [ ] Return type remains strictly `string` (no `string | undefined`).
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior

The card header badge reads `"iOS Native"` on iOS, `"Android Material"` on Android, and `"Cross-Platform"` on Web or in non-mobile test environments.

<details>
<summary>Hint</summary>

Always include the `default` branch in `Platform.select` so TypeScript knows the call can never evaluate to `undefined`:

```ts
return Platform.select({
  ios: 'iOS Native',
  android: 'Android Material',
  default: 'Cross-Platform',
});
```

</details>

---

## Exercise 2 (Intermediate): Platform-Idiomatic Depth & Touch Feedback

### Requirements

- Complete `getCardDepthStyle(elevated)` so that when `elevated` is `true`, it uses `Platform.select<ViewStyle>`:
  - `ios`: returns `shadowColor`, `shadowOffset`, `shadowOpacity`, and `shadowRadius`.
  - `android`: returns `elevation` (e.g., `4`).
  - `default`: returns a safe fallback `ViewStyle`.
- Keep the outer wrapper `View` carrying `getCardDepthStyle(elevated)` (with a solid background color) and the inner `Pressable` carrying `overflow: 'hidden'` so iOS shadows are never clipped while Android ripples stay inside the rounded corners.
- Add `android_ripple` to `Pressable` for Material touch feedback on Android, and use the `style={({ pressed }) => [...]}` callback to dim opacity slightly (`opacity: 0.78`) when `Platform.OS === 'ios' && pressed`.

### Acceptance Criteria

- [ ] `getCardDepthStyle(false)` returns `{}` and `getCardDepthStyle(true)` returns platform-specific depth styles.
- [ ] Outer `View` has a solid `backgroundColor` and `borderRadius: 14` so iOS renders a smooth drop shadow without clipping.
- [ ] `Pressable` configures `android_ripple` and iOS pressed opacity feedback while keeping `overflow: 'hidden'` on the inner card style.
- [ ] `npm run typecheck` and `npm run lint` pass cleanly.

### Expected Behavior

On iOS, the card shows a subtle drop shadow and dims smoothly while held down. On Android, the card displays crisp Material elevation and emits a rounded ink ripple clipped neatly within the card borders on press.

<details>
<summary>Hint</summary>

Pass an array from `Pressable`'s style function:

```tsx
style={({ pressed }) => [
  styles.card,
  Platform.OS === 'ios' && pressed ? styles.pressedIos : undefined,
]}
```

Remember that on iOS, a shadow only appears cleanly on a `View` that has a non-transparent `backgroundColor` and does **not** set `overflow: 'hidden'`.

</details>

---

## Exercise 3 (Challenge): Dark Mode & Platform-Specific Haptics Files

### Requirements

- Read the active OS theme with `useColorScheme()` (`const isDark = useColorScheme() === 'dark';`) and adapt the wrapper background, card surface, border, title, subtitle, badge pill, and `android_ripple` colors for both light and dark modes.
- Create a pair of platform-specific helper files alongside your component — `PlatformHaptics.ios.ts` and `PlatformHaptics.android.ts` (plus a shared fallback `PlatformHaptics.ts` for Web/TypeScript resolution) — exporting an identical function signature `export async function triggerCardFeedback(): Promise<void>`:
  - iOS calls `Haptics.selectionAsync()`.
  - Android calls `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.
  - Default/Web resolves cleanly as a no-op.

### Acceptance Criteria

- [ ] Toggling system Dark Mode updates card surface, border, badge, text, and ripple contrast without losing readability.
- [ ] `PlatformHaptics.ios.ts`, `PlatformHaptics.android.ts`, and `PlatformHaptics.ts` expose the exact same exported function signature and compile cleanly under strict TypeScript.
- [ ] Importing `triggerCardFeedback` without any platform extension works seamlessly in Metro.
- [ ] `npm run typecheck` and `npm run lint` pass with zero warnings or errors.

### Expected Behavior

Switching between Light and Dark Mode keeps the card crisp and readable on both themes, and tapping the card produces platform-idiomatic tactile feedback without any `if (Platform.OS === ...)` branching inside the component's press handler.

<details>
<summary>Hint</summary>

When adding `.ios.ts` and `.android.ts` files in a strict TypeScript project, keep a base `PlatformHaptics.ts` file with the exact same exported function signature (`export async function triggerCardFeedback(): Promise<void>`). TypeScript resolves imports against `PlatformHaptics.ts` during `tsc --noEmit`, while Metro automatically bundles `.ios.ts` on iOS and `.android.ts` on Android!

</details>

---

## Reference Solution

<details>
<summary>Click to view solution link (only after trying!)</summary>

Compare your completed component with [`../solutions/PlatformCardSolution.tsx`](../solutions/PlatformCardSolution.tsx).

</details>
