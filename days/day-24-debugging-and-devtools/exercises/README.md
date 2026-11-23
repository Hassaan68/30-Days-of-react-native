# Day 24 Exercises: Debugging, Error Boundaries & Diagnostics

Open [`ErrorFallbackExercise.tsx`](./ErrorFallbackExercise.tsx) and build a production-grade Error Boundary fallback screen across three difficulty levels.

## 1. Beginner — Safe, Accessible Recovery Screen
1. Wrap the screen in `SafeAreaView` from `react-native-safe-area-context`.
2. Replace displaying raw `error.message` to end users with calm, friendly recovery copy and a subtle `error.name` badge.
3. Add `accessibilityRole="header"` to the title and `accessibilityRole="button"`, `accessibilityLabel`, and `minHeight: 48` to the **Try Again** `Pressable`.

## 2. Intermediate — Collapsible Developer Details
1. Resolve `isDebugAllowed = showDebugDetails ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false)`.
2. Add `detailsVisible` state and a toggle `Pressable` (`accessibilityState={{ expanded: detailsVisible }}`) rendered **only** when `isDebugAllowed` is `true`.
3. Render the technical error report inside a `ScrollView` with selectable monospace-friendly `<Text>` when expanded.

## 3. Challenge — Structured Diagnostic Reporting
1. Complete `buildDiagnosticReport(error, componentStack)` to include an ISO timestamp, `Platform.OS`, `Platform.Version`, `error.name`, `error.message`, and a safely truncated `componentStack`.
2. When `onReportIssue` is passed, render a secondary **Report Issue** button that calls `onReportIssue(report)` once and transitions to a disabled `"Diagnostics Sent"` state.
3. Wire your finished component into `AppErrorBoundary`'s `fallback` prop and test it with a component that throws on button press.

## Reference Solution
Compare your work against [`../solutions/ErrorFallbackSolution.tsx`](../solutions/ErrorFallbackSolution.tsx).
