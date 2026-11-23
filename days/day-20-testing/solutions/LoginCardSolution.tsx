import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginCardProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
}

export function validateLoginCredentials(credentials: LoginCredentials): string | null {
  const normalizedEmail = credentials.email.trim();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return 'Please enter a valid email address.';
  }
  if (credentials.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

export function LoginCardSolution({ onLogin }: LoginCardProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const validationError = validateLoginCredentials({ email: normalizedEmail, password });

    if (validationError) {
      setErrorMessage(validationError);
      setSignedInEmail(null);
      return;
    }

    setErrorMessage(null);
    setSignedInEmail(null);
    setIsSubmitting(true);

    try {
      await onLogin({ email: normalizedEmail, password });
      setSignedInEmail(normalizedEmail);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        accessibilityLabel="Email address"
        autoCapitalize="none"
        editable={!isSubmitting}
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
        value={email}
      />

      <TextInput
        accessibilityLabel="Password"
        editable={!isSubmitting}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      {signedInEmail ? (
        <Text style={styles.successText}>Welcome back, {signedInEmail}!</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        accessibilityState={{ disabled: isSubmitting }}
        disabled={isSubmitting}
        onPress={() => {
          void handleSubmit();
        }}
        style={[styles.button, isSubmitting ? styles.buttonDisabled : undefined]}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  successText: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LoginCardSolution;
