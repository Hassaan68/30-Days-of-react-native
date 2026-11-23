import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ErrorFallbackSolutionProps {
  error: Error;
  componentStack?: string;
  resetError: () => void;
  /** Override whether technical error details can be expanded (defaults to `__DEV__`). */
  showDebugDetails?: boolean;
  /** Optional callback receiving a structured, non-sensitive crash report string. */
  onReportIssue?: (reportText: string) => void;
}

const MAX_STACK_LENGTH = 1200;

/**
 * Builds a concise, human-readable diagnostic report safe for attaching to a
 * bug report or sending to an issue tracker.
 */
export function buildDiagnosticReport(error: Error, componentStack?: string): string {
  const lines: string[] = [
    `Timestamp: ${new Date().toISOString()}`,
    `Platform: ${Platform.OS} (${String(Platform.Version)})`,
    `Error: ${error.name}: ${error.message}`,
  ];

  if (componentStack && componentStack.trim().length > 0) {
    const trimmedStack = componentStack.trim().slice(0, MAX_STACK_LENGTH);
    lines.push('Component Stack:', trimmedStack);
  }

  return lines.join('\n');
}

/**
 * Complete reference solution for the Day 24 Error Fallback UI exercise.
 */
export function ErrorFallbackSolution({
  error,
  componentStack,
  resetError,
  showDebugDetails,
  onReportIssue,
}: ErrorFallbackSolutionProps) {
  const isDebugAllowed = showDebugDetails ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleReportIssue = () => {
    if (!onReportIssue) {
      return;
    }
    const report = buildDiagnosticReport(error, componentStack);
    onReportIssue(report);
    setReportSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={2}>
          Something went wrong
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={2}>
          An unexpected error interrupted this screen. Tap Try Again to recover without losing your
          saved data.
        </Text>

        <View style={styles.errorCodeBadge}>
          <Text style={styles.errorCodeText} maxFontSizeMultiplier={1.5}>
            Error type: {error.name}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Clears the error and reloads the screen"
            onPress={resetError}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText} maxFontSizeMultiplier={1.8}>
              Try Again
            </Text>
          </Pressable>

          {onReportIssue ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={reportSubmitted ? 'Issue reported' : 'Report issue'}
              accessibilityState={{ disabled: reportSubmitted }}
              disabled={reportSubmitted}
              onPress={handleReportIssue}
              style={({ pressed }) => [
                styles.secondaryButton,
                reportSubmitted && styles.secondaryButtonDisabled,
                pressed && !reportSubmitted && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText} maxFontSizeMultiplier={1.8}>
                {reportSubmitted ? 'Diagnostics Sent' : 'Report Issue'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {isDebugAllowed ? (
          <View style={styles.debugSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                detailsVisible ? 'Hide technical details' : 'Show technical details'
              }
              accessibilityState={{ expanded: detailsVisible }}
              onPress={() => setDetailsVisible((prev) => !prev)}
              style={styles.debugToggle}
            >
              <Text style={styles.debugToggleText}>
                {detailsVisible ? 'Hide Technical Details' : 'Show Technical Details'}
              </Text>
            </Pressable>

            {detailsVisible ? (
              <ScrollView style={styles.debugPanel}>
                <Text selectable={true} style={styles.debugCode}>
                  {buildDiagnosticReport(error, componentStack)}
                </Text>
              </ScrollView>
            ) : null}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  errorCodeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorCodeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonPressed: {
    backgroundColor: '#1E40AF',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  debugSection: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  debugToggle: {
    minHeight: 44,
    justifyContent: 'center',
  },
  debugToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  debugPanel: {
    maxHeight: 180,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  debugCode: {
    fontSize: 12,
    lineHeight: 18,
    color: '#E2E8F0',
  },
});
