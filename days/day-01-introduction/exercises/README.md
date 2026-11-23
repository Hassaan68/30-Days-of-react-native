# Day 01 Exercises: Build Your React Native Intro Card

Practice creating your first React Native screen using `SafeAreaView`, `View`, `Text`, `Pressable`, `Platform`, and `StyleSheet.create`.

## How to Practise

1. Open the starter file [`./IntroCardExercise.tsx`](./IntroCardExercise.tsx) and work through the `// TODO:` comments one tier at a time.
2. Preview your screen live by running `npm start` from the repository root (or copying the component into `app/index.tsx` in your own Expo app).
3. Verify there are zero TypeScript or lint issues by running:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### 1. Beginner — Personalize the Intro Card

**Requirements**
- Replace the placeholder name (`"Your Name Here"`) and learning goal with your own details.
- Replace the placeholder items in `LEARNING_REASONS` with at least **3 real reasons** you are learning React Native.
- Render all reasons cleanly inside the white card using `<Text>`.

**Acceptance Criteria**
- [ ] Your personal name and goal appear prominently on screen.
- [ ] All 3 learning reasons render inside the card with unique `key` props and no remaining `"TODO"` placeholder strings.
- [ ] Every piece of visible text is wrapped inside a `<Text>` component.

**Expected Behavior**
- Opening the screen displays your personalized heading, goal subtitle, and a bulleted card listing your 3 learning reasons inside safe area boundaries.

<details>
<summary>Hint</summary>

Update the `LEARNING_REASONS` array at the top of `IntroCardExercise.tsx` with 3 distinct strings (since each string is used as its own `key={reason}`), then edit the `<Text style={styles.heading}>` and `<Text style={styles.goal}>` elements in JSX.

</details>

---

### 2. Intermediate — Interactive Day 01 Check-In

**Requirements**
- Ensure tapping the primary `<Pressable>` toggles `isCheckedIn` using a functional state updater.
- Update the button text between `"Check In for Day 01"` and `"Checked In — Day 01 Complete!"`.
- Visually change the button's background color (for example, blue `#2563EB` when unchecked → green `#16A34A` when checked in) and add pressed-state feedback using the `style={({ pressed }) => [...]}` callback.
- Add a status badge showing `"Not Checked In"` vs. `"Checked In"`.

**Acceptance Criteria**
- [ ] Tapping the primary button toggles between checked-in and unchecked states reliably on every tap.
- [ ] The button background color and label both update when `isCheckedIn` is `true`.
- [ ] Holding down on the button gives visible press feedback (`opacity` or darker background).

**Expected Behavior**
- Initially, the status badge reads `"Not Checked In"` and the blue button reads `"Check In for Day 01"`.
- After one tap, the badge switches to `"Checked In"` (green tint) and the button turns green with `"Checked In — Day 01 Complete!"`. Tapping again toggles back cleanly.

<details>
<summary>Hint</summary>

Use style arrays on `<Pressable>` so conditional styles override the base style cleanly:
```tsx
style={({ pressed }) => [
  styles.button,
  isCheckedIn && styles.buttonChecked,
  pressed && styles.buttonPressed,
]}
```

</details>

---

### 3. Challenge — Platform Badge & Quote Cycler

**Requirements**
- Format `Platform.OS` cleanly (`'ios'` → `'iOS'`, `'android'` → `'Android'`) and render it inside a styled pill badge (`borderRadius: 999`, tinted background, horizontal/vertical padding).
- Complete `handleNextQuote` so pressing **Next Quote** advances `quoteIndex` and wraps back to `0` after the last quote using modulo arithmetic.
- Guard array indexing safely under `noUncheckedIndexedAccess` (`QUOTES[quoteIndex] ?? 'Keep building!'`).
- Ensure both `<Pressable>` buttons define `accessibilityRole="button"` and a clear, state-aware `accessibilityLabel`.

**Acceptance Criteria**
- [ ] A pill badge shows the active platform (`Running on iOS`, `Running on Android`, or `Running on WEB`).
- [ ] Repeatedly tapping **Next Quote** cycles through all 3 quotes and wraps back to the first quote without errors or `undefined`.
- [ ] Both buttons include `accessibilityRole="button"` and descriptive `accessibilityLabel` attributes.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
- Tapping **Next Quote** updates the italicized quote text immediately on every press (`Quote 1 → Quote 2 → Quote 3 → Quote 1`).

<details>
<summary>Hint</summary>

In `handleNextQuote`, wrap the index around with modulo arithmetic:
```tsx
const handleNextQuote = (): void => {
  setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
};
```
Style the pill badge with a `<View>` wrapper using `backgroundColor: '#DBEAFE'`, `paddingHorizontal: 12`, `paddingVertical: 5`, and `borderRadius: 999`.

</details>

## Reference Solution

<details>
<summary>Only after trying: view reference solution link</summary>

Compare your completed component with [`../solutions/IntroCardSolution.tsx`](../solutions/IntroCardSolution.tsx).

</details>
