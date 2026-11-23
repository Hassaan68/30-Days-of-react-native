import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(60, 'Full name must be 60 characters or fewer'),
    email: z.string().trim().pipe(z.email('Please enter a valid email address')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((accepted) => accepted, {
      message: 'You must accept the Terms of Service to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export interface SignUpFormProps {
  onSubmitSuccess?: (values: SignUpFormValues) => Promise<void> | void;
}

/**
 * Production-ready mobile sign-up form demonstrating:
 * - React Hook Form (`useForm`, `Controller`) + Zod v4 (`zodResolver`)
 * - Keyboard focus chaining (`returnKeyType`, `submitBehavior`, `onSubmitEditing`)
 * - Field-level & root submission error handling
 * - Accessible labels, hints, checkbox state, and polite live-region errors
 */
export default function SignUpForm({ onSubmitSuccess }: SignUpFormProps) {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmPasswordRef = useRef<TextInputInstance>(null);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: SignUpFormValues) => {
    Keyboard.dismiss();
    setSubmittedEmail(null);

    try {
      if (onSubmitSuccess) {
        await onSubmitSuccess(values);
      } else {
        // Simulated async sign-up request
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
        if (values.email.toLowerCase() === 'taken@example.com') {
          setError('email', {
            type: 'server',
            message: 'An account with this email already exists',
          });
          return;
        }
      }

      setSubmittedEmail(values.email);
      reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setError('root', { type: 'server', message });
    }
  };

  const submitForm = (): void => {
    void handleSubmit(onSubmit)();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>
            Start your 30-day React Native journey with a synced learning profile.
          </Text>

          {errors.root?.message ? (
            <View
              style={styles.bannerError}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.bannerErrorText}>{errors.root.message}</Text>
            </View>
          ) : null}

          {submittedEmail ? (
            <View
              style={styles.bannerSuccess}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.bannerSuccessText}>
                Welcome aboard! Verification sent to {submittedEmail}.
              </Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Alex Rivera"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  accessibilityLabel="Full Name"
                  accessibilityHint="Enter your first and last name"
                />
              )}
            />
            {errors.fullName?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.fullName.message}
              </Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={emailRef}
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="alex@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  accessibilityLabel="Email Address"
                  accessibilityHint="Enter the email you will use to sign in"
                />
              )}
            />
            {errors.email?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.email.message}
              </Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, errors.password && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="At least 8 chars, 1 uppercase & 1 number"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  accessibilityLabel="Password"
                  accessibilityHint="Must contain at least 8 characters, one uppercase letter, and one number"
                />
              )}
            />
            {errors.password?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.password.message}
              </Text>
            ) : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                  onSubmitEditing={submitForm}
                  accessibilityLabel="Confirm Password"
                  accessibilityHint="Re-enter the exact same password"
                />
              )}
            />
            {errors.confirmPassword?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.confirmPassword.message}
              </Text>
            ) : null}
          </View>

          {/* Terms Checkbox */}
          <View style={styles.fieldGroup}>
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field: { onChange, value } }) => (
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => onChange(!value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: value }}
                  accessibilityLabel="Accept Terms of Service"
                  accessibilityHint="Double tap to toggle acceptance of the terms"
                >
                  <View style={[styles.checkboxBox, value && styles.checkboxChecked]}>
                    {value ? <Text style={styles.checkboxMark}>✓</Text> : null}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the Terms of Service and Privacy Policy
                  </Text>
                </Pressable>
              )}
            />
            {errors.acceptTerms?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.acceptTerms.message}
              </Text>
            ) : null}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.submitDisabled,
              pressed && !isSubmitting && styles.submitPressed,
            ]}
            onPress={submitForm}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Create Account"
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Account</Text>
            )}
          </Pressable>
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
  container: {
    padding: 20,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  subheading: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 4,
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
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bannerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  bannerErrorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '500',
  },
  bannerSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  bannerSuccessText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '500',
  },
});
