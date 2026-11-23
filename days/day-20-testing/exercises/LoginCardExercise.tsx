import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginCardProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
}

/**
 * TODO 1: Validate credentials before calling the async `onLogin` handler.
 * - Return "Please enter a valid email address." if trimmed email is empty or lacks "@".
 * - Return "Password must be at least 6 characters." if password length < 6.
 * - Return null when valid.
 */
export function validateLoginCredentials(_credentials: LoginCredentials): string | null {
  return null;
}

export function LoginCardExercise({ onLogin }: LoginCardProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    const validationError = validateLoginCredentials({ email, password });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // TODO 2: Track `isSubmitting` loading state and `signedInEmail` success state.
    // TODO 3: Catch errors from `await onLogin(...)` and surface a user-friendly alert message.
    await onLogin({ email: email.trim().toLowerCase(), password });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        accessibilityLabel="Email address"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
        value={email}
      />

      <TextInput
        accessibilityLabel="Password"
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        onPress={() => {
          void handleSubmit();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sign in</Text>
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
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LoginCardExercise;
