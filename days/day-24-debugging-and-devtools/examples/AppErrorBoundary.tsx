import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ErrorFallbackRenderProps {
  error: Error;
  componentStack?: string;
  resetError: () => void;
}

export interface AppErrorBoundaryProps {
  children: ReactNode;
  /** Optional hook for reporting caught render errors to Sentry, Crashlytics, etc. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional callback invoked when the user taps "Try Again". */
  onReset?: () => void;
  /** Optional custom fallback renderer replacing the built-in recovery screen. */
  fallback?: (props: ErrorFallbackRenderProps) => ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string | undefined;
}

const INITIAL_STATE: AppErrorBoundaryState = {
  hasError: false,
  error: null,
  componentStack: undefined,
};

/**
 * Top-level React Error Boundary for React Native screens and apps.
 *
 * Catches synchronous rendering, lifecycle, and constructor errors in descendant
 * components so a single broken widget never causes an unrecoverable white screen.
 * Note: Error Boundaries do NOT catch errors inside event handlers or async
 * callbacks — handle those with `try/catch` or React Query error states.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = INITIAL_STATE;

  public static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      componentStack: errorInfo.componentStack ?? undefined,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('[AppErrorBoundary] Caught rendering error:', error.message);
    }
  }

  private readonly handleReset = (): void => {
    this.setState(INITIAL_STATE);
    this.props.onReset?.();
  };

  public render(): ReactNode {
    const { hasError, error, componentStack } = this.state;

    if (!hasError || !error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback({
        error,
        componentStack,
        resetError: this.handleReset,
      });
    }

    const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Something went wrong
          </Text>
          <Text style={styles.subtitle}>
            We ran into an unexpected display error. Your saved data is safe — tap below to reload
            this screen.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Resets the screen and attempts to render again"
            onPress={this.handleReset}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>

          {isDev ? (
            <View style={styles.devBox}>
              <Text style={styles.devHeading}>Developer Details (__DEV__ only)</Text>
              <ScrollView style={styles.devScroll}>
                <Text selectable={true} style={styles.devCode}>
                  {error.name}: {error.message}
                  {componentStack ? `\n\nComponent Stack:${componentStack}` : ''}
                </Text>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }
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
    borderColor: '#E2E8F0',
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
  button: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonPressed: {
    backgroundColor: '#1E40AF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devBox: {
    marginTop: 4,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    gap: 8,
  },
  devHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    textTransform: 'uppercase',
  },
  devScroll: {
    maxHeight: 160,
  },
  devCode: {
    fontSize: 12,
    lineHeight: 18,
    color: '#E2E8F0',
  },
});
