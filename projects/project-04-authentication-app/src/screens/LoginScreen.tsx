import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '../context/AuthProvider';
import { loginSchema, type LoginFormValues } from '../validation/authSchemas';

export function LoginScreen() {
  const { signIn, error, isSubmitting, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const passwordInputRef = useRef<TextInput | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    await signIn(values);
  };

  const handleFillDemoCredentials = (): void => {
    clearError();
    setValue('email', 'alex@example.com', { shouldValidate: true });
    setValue('password', 'SecurePass123', { shouldValidate: true });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.badge}>PROJECT 04</Text>
            <Text style={styles.title} accessibilityRole="header">
              Welcome back
            </Text>
            <Text style={styles.subtitle}>
              Sign in with your account to access your protected session stored in hardware-backed
              secure storage.
            </Text>
          </View>

          {error ? (
            <View
              style={styles.errorBanner}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email ? styles.inputError : undefined]}
                    value={value}
                    onChangeText={(text) => {
                      if (error) {
                        clearError();
                      }
                      onChange(text);
                    }}
                    onBlur={onBlur}
                    placeholder="alex@example.com"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    editable={!isSubmitting}
                    accessibilityLabel="Email address"
                    accessibilityHint="Enter your account email address"
                  />
                )}
              />
              {errors.email?.message ? (
                <Text style={styles.fieldError} accessibilityLiveRegion="polite">
                  {errors.email.message}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[styles.passwordContainer, errors.password ? styles.inputError : undefined]}
              >
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.passwordInput}
                      value={value}
                      onChangeText={(text) => {
                        if (error) {
                          clearError();
                        }
                        onChange(text);
                      }}
                      onBlur={onBlur}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="current-password"
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        void handleSubmit(onSubmit)();
                      }}
                      editable={!isSubmitting}
                      accessibilityLabel="Password"
                      accessibilityHint="Enter your account password"
                    />
                  )}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.toggleButton}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  hitSlop={8}
                >
                  <Text style={styles.toggleButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              {errors.password?.message ? (
                <Text style={styles.fieldError} accessibilityLiveRegion="polite">
                  {errors.password.message}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => {
                void handleSubmit(onSubmit)();
              }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !isSubmitting ? styles.primaryButtonPressed : undefined,
                isSubmitting ? styles.primaryButtonDisabled : undefined,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleFillDemoCredentials}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.secondaryButtonPressed : undefined,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Fill demo credentials"
              accessibilityHint="Fills the form with the local demo account email and password"
            >
              <Text style={styles.secondaryButtonText}>Fill Demo Credentials</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 24,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2563EB',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingRight: 12,
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toggleButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldError: {
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
  },
});
