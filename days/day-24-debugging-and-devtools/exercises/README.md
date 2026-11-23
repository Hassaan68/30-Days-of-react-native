# Day 24 Exercises: Debugging, Error Boundaries & Diagnostics

## How to Practise

1. Open the starter file [`ErrorFallbackExercise.tsx`](./ErrorFallbackExercise.tsx) and inspect its props (`error`, `componentStack`, `resetError`, `showDebugDetails`, `onReportIssue`).
2. Implement each tier in order (**Beginner → Intermediate → Challenge**).
3. Verify strict TypeScript and ESLint after every tier from the repository root:

```bash
npm run typecheck
npm run lint
```

4. Pass your component to [`../examples/AppErrorBoundary.tsx`](../examples/AppErrorBoundary.tsx)'s `fallback` prop inside an Expo screen (launched via `npm start`) and trigger a test render error to verify recovery, collapsible dev details, and accessibility.

---

## 1. Beginner — Safe, Accessible Recovery Screen

### Requirements

1. Replace the outer `<View>` with `SafeAreaView` imported from `'react-native-safe-area-context'` (never `'react-native'`).
2. Replace rendering raw `{error.message}` directly to end users with calm, friendly recovery copy (e.g., reassuring the user their saved data is safe) plus a subtle `Error type: {error.name}` badge.
3. Add `accessibilityRole="header"` to the title `<Text>` and cap font scaling safely (`maxFontSizeMultiplier={2}`).
4. Update the **Try Again** `Pressable` with `accessibilityRole="button"`, `accessibilityLabel="Try again"`, `accessibilityHint`, press feedback styling, and `minHeight: 48`.

### Acceptance Criteria

- [ ] Imports `SafeAreaView` from `'react-native-safe-area-context'`.
- [ ] Raw `error.message` is no longer shown directly in production recovery copy.
- [ ] **Try Again** button meets the 48px minimum touch target and triggers `resetError` on press.
- [ ] Title has `accessibilityRole="header"`.

### Expected Behavior

When an error occurs, users see a clean, well-framed card with a calm explanation, a subtle error-type pill (e.g., `Error type: TypeError`), and a prominent **Try Again** button.

<details>
<summary>Hint</summary>

Check [`../examples/AppErrorBoundary.tsx`](../examples/AppErrorBoundary.tsx) for accessible button props and safe-area styling—remember to use `style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}` on `Pressable`.

</details>

---

## 2. Intermediate — Collapsible Developer Details

### Requirements

1. Compute `const isDebugAllowed = showDebugDetails ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false);`.
2. Add local `const [detailsVisible, setDetailsVisible] = useState(false);` state.
3. Render the technical details section **only** when `isDebugAllowed` is `true`:
   - Include a toggle `Pressable` with `accessibilityRole="button"`, dynamic `accessibilityLabel`, and `accessibilityState={{ expanded: detailsVisible }}`.
   - When `detailsVisible` is `true`, render the diagnostic output inside a `ScrollView` (with a bounded `maxHeight`) containing `<Text selectable={true}>`.

### Acceptance Criteria

- [ ] Passing `showDebugDetails={false}` completely hides both the toggle button and the stack panel.
- [ ] Passing `showDebugDetails={true}` displays `"Show Technical Details"`, which toggles to `"Hide Technical Details"` and reveals a scrollable, selectable report panel.
- [ ] Screen readers announce the expanded/collapsed state via `accessibilityState={{ expanded: detailsVisible }}`.

### Expected Behavior

In development mode (`__DEV__ === true`), engineers can expand and copy full error details on-device; in production builds (`__DEV__ === false`), end users never see stack traces or debug controls.

<details>
<summary>Hint</summary>

Use functional state updates (`onPress={() => setDetailsVisible((prev) => !prev)}`) and give the `ScrollView` a fixed `maxHeight` (e.g., `180`) with a dark surface (`#0F172A`) and light text (`#E2E8F0`) so long stack traces scroll smoothly without pushing buttons off screen.

</details>

---

## 3. Challenge — Structured Diagnostic Reporting

### Requirements

1. Complete `buildDiagnosticReport(error, componentStack)` to return a clean multi-line string containing:
   - `Timestamp:` ISO-8601 timestamp (`new Date().toISOString()`)
   - `Platform:` `${Platform.OS} (${String(Platform.Version)})`
   - `Error:` `${error.name}: ${error.message}`
   - `Component Stack:` trimmed and truncated to at most `1200` characters (only included when `componentStack` is non-empty after `.trim()`).
2. Add `reportSubmitted` state to `ErrorFallbackExercise`.
3. When `onReportIssue` is provided, render a secondary **Report Issue** `Pressable` (`minHeight: 48`, `accessibilityRole="button"`, `accessibilityState={{ disabled: reportSubmitted }}`):
   - Tapping it builds the report with `buildDiagnosticReport(error, componentStack)`, calls `onReportIssue(report)`, and marks `reportSubmitted` as `true`.
   - Once submitted, disable the button and update its label to `"Diagnostics Sent"`.
4. Wire your finished fallback component into `AppErrorBoundary`'s `fallback` prop and test recovering from a simulated render crash.

### Acceptance Criteria

- [ ] `buildDiagnosticReport` includes timestamp, platform info, error name/message, and truncates long `componentStack` values to ≤ 1200 chars.
- [ ] When `onReportIssue` is omitted, no **Report Issue** button is rendered.
- [ ] When `onReportIssue` is provided, tapping **Report Issue** invokes the callback **once** and transitions the button to a disabled `"Diagnostics Sent"` state.
- [ ] `npm run typecheck` and `npm run lint` pass cleanly.

### Expected Behavior

Calling `buildDiagnosticReport(new TypeError('Null item'), '\n  at TaskRow\n  at TaskList')` outputs:

```text
Timestamp: 2026-05-01T12:00:00.000Z
Platform: ios (18.0)
Error: TypeError: Null item
Component Stack:
at TaskRow
  at TaskList
```

<details>
<summary>Hint</summary>

Build an array of strings (`const lines: string[] = [...]`), conditionally push `'Component Stack:'` and `componentStack.trim().slice(0, 1200)`, and return `lines.join('\n')`. Remember to wrap `Platform.Version` in `String(Platform.Version)` because it can be a `number` on Android and a `string` on iOS.

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to view the reference solution link</summary>

Once you have built and verified your fallback screen, compare your work against [`../solutions/ErrorFallbackSolution.tsx`](../solutions/ErrorFallbackSolution.tsx).

</details>
