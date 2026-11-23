import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ErrorFallbackExerciseProps {
  error: Error;
  componentStack?: string;
  resetError: () => void;
  /** Override whether developer stack details are displayed (defaults to `__DEV__`). */
  showDebugDetails?: boolean;
  /** Optional callback triggered when the user chooses to report the crash. */
  onReportIssue?: (reportText: string) => void;
}

/**
 * Day 24 Exercise Starter: Production-Ready Error Fallback UI
 *
 * Build a clean recovery screen to pair with `AppErrorBoundary`:
 * 1. Show a calm, user-friendly heading and recovery message (never raw stack traces in prod).
 * 2. Wire up the "Try Again" button to `resetError` with accessible semantics.
 * 3. In development (`showDebugDetails`), add a toggle button to expand/collapse
 *    technical error details inside a scrollable panel.
 * 4. Implement `buildDiagnosticReport` and wire an optional "Report Issue" button
 *    that calls `onReportIssue` with a formatted diagnostic summary.
 *
 * Compare your solution with `../solutions/ErrorFallbackSolution.tsx`.
 */
export function buildDiagnosticReport(error: Error, _componentStack?: string): string {
  // TODO (Challenge): Include error name, message, platform OS, ISO timestamp,
  // and truncated componentStack (if present) without leaking sensitive data.
  return error.message;
}

export function ErrorFallbackExercise({
  error,
  componentStack: _componentStack,
  resetError,
  showDebugDetails: _showDebugDetails,
  onReportIssue: _onReportIssue,
}: ErrorFallbackExerciseProps) {
  // TODO (Intermediate): Add local state `detailsVisible` to toggle technical details in dev mode.

  return (
    <View style={styles.container}>
      {/* TODO (Beginner): Wrap in SafeAreaView from 'react-native-safe-area-context' */}
      <View style={styles.card}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{error.message}</Text>

        {/* TODO (Beginner): Add accessibilityRole="button", accessibilityLabel, and minHeight >= 48 */}
        <Pressable onPress={resetError} style={styles.button}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>

        {/* TODO (Intermediate): Render expandable technical details ONLY when showDebugDetails is true */}
        {/* TODO (Challenge): Render a secondary "Report Issue" Pressable when onReportIssue is provided */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  message: {
    fontSize: 14,
    color: '#475569',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
