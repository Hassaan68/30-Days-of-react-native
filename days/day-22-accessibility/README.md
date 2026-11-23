# Day 22: Accessibility

## Learning Objectives
By the end of Day 22, you will be able to:
- Explain why mobile accessibility (a11y) improves usability for everyone and is often a legal and app-store requirement.
- Apply React Native's core accessibility props (`accessible`, `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`, `accessibilityState`, `accessibilityValue`, `accessibilityLiveRegion`) accurately.
- Enforce platform touch-target standards (44×44 pt on iOS, 48×48 dp on Android) using layout sizing and `hitSlop`.
- Meet WCAG 2.1 color contrast ratios (4.5:1 for normal text, 3:1 for large text and UI components).
- Support Dynamic Type / OS font scaling (`allowFontScaling`, `maxFontSizeMultiplier`) and Reduced Motion (`AccessibilityInfo.isReduceMotionEnabled`).
- Test accessibility manually with VoiceOver (iOS) and TalkBack (Android) and automatically with React Native Testing Library.

## Prerequisites
- Completion of [Day 05: Styling and Layout](../day-05-styling-and-layout/README.md), [Day 06: Core Components](../day-06-core-components/README.md), and [Day 20: Testing](../day-20-testing/README.md).
- Basic familiarity with `Pressable`, `Switch`, `StyleSheet`, and custom React hooks.

## Introduction
Over **1 billion people worldwide** live with a permanent disability affecting vision, hearing, motor control, or cognition — and virtually *every* mobile user experiences temporary or situational impairments: using a phone one-handed on a crowded train, reading a screen in harsh sunlight, or holding a sleeping child while muting audio.

**Accessibility (often abbreviated a11y)** is the practice of building apps that work seamlessly with assistive technologies — screen readers, switch controls, voice control, larger system fonts, and reduced-motion preferences — without forcing users into a degraded experience. In React Native, accessibility is built directly into core components and maps onto native iOS `UIAccessibility` and Android `AccessibilityNodeInfo` APIs. Designing for accessibility from day one takes far less effort than retrofitting an entire app before launch.

## Concepts

### 1. Screen Readers: VoiceOver (iOS) & TalkBack (Android)
Screen readers let blind and low-vision users navigate an app entirely by sound and touch gestures:
- **VoiceOver (iOS)**: Swipe right/left to move focus sequentially across elements; double-tap anywhere to activate the focused element. Enable via **Settings → Accessibility → VoiceOver** (or **Accessibility Inspector** in Xcode for the iOS Simulator).
- **TalkBack (Android)**: Same swipe-to-focus and double-tap-to-activate model. Enable via **Settings → Accessibility → TalkBack** on an Android device or emulator (with Google Accessibility Suite installed).

When a screen reader focuses a component, it typically announces four pieces of information in order:
1. **Label** — *What is this?* (`accessibilityLabel` or child text)
2. **Value** — *What is its current numeric/text value?* (`accessibilityValue`)
3. **Role & State** — *What kind of control is it, and is it on/off/disabled?* (`accessibilityRole`, `accessibilityState`)
4. **Hint** — *What happens if I activate it?* (`accessibilityHint`, read after a brief pause)

### 2. Core React Native Accessibility Props

| Prop | Purpose | Example |
| --- | --- | --- |
| `accessible` | When `true`, groups the view and all its children into a single screen-reader focus stop. | `<Pressable accessible={true}>` |
| `accessibilityLabel` | Explicit spoken label. **Required** on icon-only buttons or grouped views whose child text is unclear. | `"Close modal"` |
| `accessibilityHint` | Briefly describes the *result* of an action (do not repeat the label or role). | `"Returns to the previous screen"` |
| `accessibilityRole` | Communicates the semantic widget type (`"button"`, `"switch"`, `"header"`, `"link"`, `"checkbox"`, `"adjustable"`, `"alert"`, `"tab"`, etc.). | `accessibilityRole="switch"` |
| `accessibilityState` | Describes dynamic widget state: `{ disabled, selected, checked, busy, expanded }`. | `accessibilityState={{ checked: true, disabled: false }}` |
| `accessibilityValue` | Describes range or text values: `{ min, max, now, text }` (ideal for sliders & progress bars). | `accessibilityValue={{ min: 0, max: 100, now: 65, text: '65%' }}` |
| `accessibilityLiveRegion` | Android prop (`"none"`, `"polite"`, `"assertive"`) that automatically speaks text changes without moving focus. Pair with `AccessibilityInfo.announceForAccessibility()` on iOS. | `accessibilityLiveRegion="polite"` |

> **Hiding decorative elements:** When a parent `Pressable` already provides a complete `accessibilityLabel` and `accessibilityState`, hide decorative icons or duplicate badges inside it with `accessible={false}`, `importantForAccessibility="no-hide-descendants"` (Android), and `accessibilityElementsHidden={true}` (iOS).

### 3. Minimum Touch Target Sizes & `hitSlop`
Users with motor impairments — or anyone walking while tapping — struggle with tiny tap targets:
- **Apple Human Interface Guidelines (iOS):** Minimum **44 × 44 pt**.
- **Material Design Guidelines (Android):** Minimum **48 × 48 dp**.

Targeting **48 × 48** everywhere satisfies both platforms comfortably. If a visual icon needs to look smaller (for example, a 36 × 36 circular button in a compact header), expand its invisible touch area using `hitSlop`:

```tsx
// Visual size is 36x36; adding 6pt on each edge yields a 48x48 touch target.
<Pressable hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }} ... />
```

### 4. WCAG 2.1 Color Contrast Ratios
Low-contrast light-gray text on white backgrounds looks sleek on a calibrated studio monitor, but becomes unreadable outdoors or for users with low vision or color vision deficiency:
- **Normal text (< 18pt regular or < 14pt bold):** Minimum **4.5:1** contrast ratio (WCAG AA).
- **Large text (≥ 18pt regular or ≥ 14pt bold) and UI components / icons:** Minimum **3.0:1** contrast ratio (WCAG AA).
- **Never rely on color alone** to communicate state (e.g., error vs. success). Always pair color with an icon, text label, or pattern.

| Foreground | Background | Ratio | WCAG AA Result |
| --- | --- | --- | --- |
| `#0F172A` (Slate 900) | `#FFFFFF` | 17.8:1 | Passes AAA |
| `#475569` (Slate 600) | `#FFFFFF` | 7.6:1 | Passes AAA |
| `#1D4ED8` (Blue 700) | `#FFFFFF` | 6.7:1 | Passes AA |
| `#94A3B8` (Slate 400) | `#FFFFFF` | 2.6:1 | Fails AA for text |
| `#CBD5E1` (Slate 300) | `#FFFFFF` | 1.5:1 | Fails AA completely |

### 5. Dynamic Type & Font Scaling
Both iOS (Dynamic Type) and Android (Font Size / Display Size) allow users to scale system text up to 200% or more.
- By default, React Native `<Text>` sets `allowFontScaling={true}`. **Do not globally disable font scaling** (`allowFontScaling={false}`) on body text!
- Instead, avoid fixed pixel `height` values on containers holding text — use `minHeight` and `paddingVertical` so rows grow naturally.
- Use `maxFontSizeMultiplier` (e.g., `maxFontSizeMultiplier={2}` on body text or `1.5` on compact badges/tabs) to allow generous scaling while preventing extreme layouts from overlapping.

### 6. Respecting Reduced Motion
Some users experience vestibular discomfort (dizziness or nausea) from zooming, parallax, or spring-bounce animations. Query and subscribe to the system preference via `AccessibilityInfo`:

```ts
const enabled = await AccessibilityInfo.isReduceMotionEnabled();
const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
```

When reduced motion is enabled, replace sliding/scaling transitions with instant changes or gentle opacity/color fades.

### 7. Automated Accessibility Testing with React Native Testing Library
React Native Testing Library encourages **accessibility-first queries** (`getByRole`, `getByLabelText`, `getByA11yHint`). If your test can locate a control by role and label, a screen reader user can too:

```tsx
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibleSettingsRow } from './AccessibleSettingsRow';

test('announces switch state and toggles on press', () => {
  const onValueChange = jest.fn();
  render(
    <AccessibleSettingsRow
      title="Push Notifications"
      description="Receive daily reminders"
      value={false}
      onValueChange={onValueChange}
    />,
  );

  const toggle = screen.getByRole('switch', {
    name: /Push Notifications/i,
  });

  expect(toggle.props.accessibilityState).toEqual({
    checked: false,
    disabled: false,
  });

  fireEvent.press(toggle);
  expect(onValueChange).toHaveBeenCalledWith(true);
});
```

## Code Examples
Explore the complete, strictly typed examples in [`./examples/`](./examples/):
1. [`examples/AccessibleSettingsRow.tsx`](./examples/AccessibleSettingsRow.tsx) — Single-focus-stop accessible settings row combining `accessibilityRole="switch"`, `accessibilityState`, `accessibilityLiveRegion`, `AccessibilityInfo.announceForAccessibility`, `maxFontSizeMultiplier`, WCAG AA contrast, and Reduced Motion awareness.
2. [`examples/AccessibleIconButton.tsx`](./examples/AccessibleIconButton.tsx) — Compact 36×36 icon button expanded to a 48×48 touch target via `hitSlop`, with mandatory `accessibilityLabel`, badge count announcements, and `busy`/`disabled` states.

## Step-by-Step Explanation
Let's trace why `AccessibleSettingsRow.tsx` is structured the way it is:
1. **Grouping with `Pressable` (`accessible={true}`):** Without grouping, VoiceOver stops on the title, then the description, then the switch — forcing 3 swipes per row. Grouping makes the entire row one cohesive `switch` control.
2. **Hiding the inner `Switch`:** Because the outer `Pressable` handles `onPress` and declares `accessibilityRole="switch"` with `accessibilityState={{ checked: value, disabled }}`, we wrap the visual `<Switch>` in a `<View>` with `accessible={false}`, `importantForAccessibility="no-hide-descendants"`, `accessibilityElementsHidden={true}`, and `pointerEvents="none"`. That prevents double announcements or nested focus traps.
3. **Cross-platform live announcements:** When toggled, Android reads the hidden `<Text accessibilityLiveRegion="polite">` automatically, while iOS announces the update through `AccessibilityInfo.announceForAccessibility(announcement)`.
4. **Reduced-motion press feedback:** `useEffect` reads `AccessibilityInfo.isReduceMotionEnabled()` and listens to `reduceMotionChanged`. When reduced motion is active, pressing changes only the background color (`rowPressedStatic`) instead of applying `transform: [{ scale: 0.99 }]`.
5. **Flexible height + capped font scaling:** Using `minHeight: 60` (never a fixed `height`) with `allowFontScaling={true}` and `maxFontSizeMultiplier={2}` allows text to double in size cleanly without clipping.

## Common Mistakes
- **Icon-only buttons without `accessibilityLabel`:** A `<Pressable><Text>✕</Text></Pressable>` leaves screen readers announcing `"multiplication sign"` or nothing at all. Always pass a clear `accessibilityLabel="Close"`.
- **Putting the role in the label:** Writing `accessibilityLabel="Submit button"` alongside `accessibilityRole="button"` makes VoiceOver announce `"Submit button, button"`. Keep labels clean (`"Submit"`).
- **Hardcoded container `height` around `<Text>`:** When a user turns on 200% Dynamic Type, fixed heights clip text vertically. Always use `minHeight` and padding.
- **Disabling `allowFontScaling={false}` globally:** This breaks accessibility for millions of low-vision users who rely on larger system fonts.
- **Nested interactive controls:** Putting a tappable `<Switch>` inside a tappable `<Pressable>` causes confusing focus order and duplicate announcements.
- **Low-contrast placeholder or secondary text:** Trendy light grays (`#CBD5E1`, `#9CA3AF`) frequently fail the 4.5:1 WCAG AA threshold.

## Best Practices
- **Audit with real screen readers early:** Turn on VoiceOver or TalkBack on your own phone once per feature and try completing the main user flow with your eyes closed.
- **Enforce `label` as a required TypeScript prop** on every icon-only component (as done in `AccessibleIconButton.tsx`) so inaccessible icon buttons fail at compile time.
- **Use `accessibilityRole="header"`** on screen and section headings so screen reader users can jump quickly between sections using rotor/heading navigation.
- **Prefer semantic queries in tests:** Query with `getByRole` and `getByLabelText` before falling back to `getByTestId`.
- **Test at 200% system font size and with Reduce Motion enabled** before shipping a release.

## Exercises
Work through the guided exercises in [`./exercises/README.md`](./exercises/README.md) using the starter file [`./exercises/AccessibleToggleExercise.tsx`](./exercises/AccessibleToggleExercise.tsx):
- **Beginner:** Fix touch target size, WCAG color contrast, switch semantics (`accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState`), and hide the duplicate visual `ON`/`OFF` pill.
- **Intermediate:** Support Dynamic Type safely with `allowFontScaling` and `maxFontSizeMultiplier={2}`, and announce state changes politely across iOS and Android.
- **Challenge:** Build a reusable `useReducedMotion()` hook, disable press-scale transforms when Reduced Motion is active, and write a React Native Testing Library test verifying the accessible switch contract.

## Solutions
Review the full, cleanly typed reference implementation in [`./solutions/AccessibleToggleSolution.tsx`](./solutions/AccessibleToggleSolution.tsx).
- `useReducedMotion()` encapsulates the async check and listener cleanup so any screen or animated component can respect OS motion settings.
- `AccessibleToggleSolution` demonstrates single-focus-stop grouping, WCAG AAA text contrast (`#475569` on `#FFFFFF`), capped Dynamic Type scaling, and cross-platform live announcements.
- `AccessiblePreferencesDemo` composes the toggles inside a `SafeAreaView` from `react-native-safe-area-context` with a semantic `accessibilityRole="header"` title.

## Mini Project
**Accessible Profile & Settings Screen Audit**
Open your Profile App from [Day 07](../day-07-first-mobile-app/README.md) or Task Manager from [Day 21](../day-21-task-manager/README.md) and perform a full accessibility pass:
1. Ensure every screen heading has `accessibilityRole="header"`.
2. Add explicit `accessibilityLabel` and 48×48 touch targets (via `minWidth`/`minHeight` or `hitSlop`) to every icon button and task checkbox.
3. Add `accessibilityValue` to any progress bar or completion counter (e.g., `"3 of 5 tasks completed"`).
4. Bump your simulator or device font size to **200%** and fix any clipped or overlapping rows.
5. Enable VoiceOver or TalkBack and complete creating, toggling, and deleting a task without looking at the screen.

## Key Takeaways
- Accessibility is built into React Native via native `UIAccessibility` and `AccessibilityNodeInfo` mappings.
- Every interactive control needs a clear **label**, **role**, **state**, and at least a **44×44 pt / 48×48 dp** touch target.
- Maintain at least **4.5:1** contrast for normal text, allow Dynamic Type scaling with flexible `minHeight` layouts, and respect `Reduce Motion`.
- Testing with `getByRole` and `getByLabelText` catches accessibility regressions automatically in CI.

## Further Reading
- [React Native Accessibility Guide](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Android Accessibility Overview](https://developer.android.com/guide/topics/ui/accessibility)
- [React Native Testing Library — Queries](https://callstack.github.io/react-native-testing-library/docs/api/queries)

## Progress Checklist
- [ ] Read all concepts and inspected both code examples in `./examples/`
- [ ] Completed Beginner, Intermediate, and Challenge tasks in `./exercises/AccessibleToggleExercise.tsx`
- [ ] Compared my implementation with `./solutions/AccessibleToggleSolution.tsx`
- [ ] Tested at least one screen with VoiceOver / Accessibility Inspector or TalkBack
- [ ] Audited touch targets, contrast ratios, and 200% font scaling in my mini project

## Next Day
Continue to [Day 23: Security](../day-23-security/README.md) to learn how to protect tokens, user data, and API communication in production React Native apps.
