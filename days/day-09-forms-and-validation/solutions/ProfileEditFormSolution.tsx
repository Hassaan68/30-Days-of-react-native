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

const BIO_MAX_LENGTH = 160;

export const profileEditSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(40, 'Display name must be 40 characters or fewer'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or fewer')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  bio: z.string().trim().max(BIO_MAX_LENGTH, `Bio must be ${BIO_MAX_LENGTH} characters or fewer`),
  website: z
    .string()
    .trim()
    .pipe(
      z.union([
        z.literal(''),
        z.url('Please enter a valid URL starting with https:// or http://'),
      ]),
    ),
});

export type ProfileEditValues = z.infer<typeof profileEditSchema>;

export interface ProfileEditFormProps {
  initialValues?: ProfileEditValues;
  onSave?: (values: ProfileEditValues) => Promise<void> | void;
}

const DEFAULT_PROFILE: ProfileEditValues = {
  displayName: 'Maya Chen',
  username: 'mayachen_dev',
  bio: 'Building cross-platform apps with React Native and Expo.',
  website: 'https://reactnative.dev',
};

/**
 * Complete solution for Day 09:
 * - Zod v4 schema with regex, length limits, and optional URL union
 * - Controlled inputs with keyboard focus chaining
 * - Live bio character counter and accessible live-region error messages
 * - Dirty-state Save button protection and Reset button
 */
export default function ProfileEditFormSolution({
  initialValues = DEFAULT_PROFILE,
  onSave,
}: ProfileEditFormProps) {
  const [savedNotice, setSavedNotice] = useState(false);

  const usernameRef = useRef<TextInputInstance>(null);
  const bioRef = useRef<TextInputInstance>(null);
  const websiteRef = useRef<TextInputInstance>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  const bioValue = watch('bio');
  const canSave = isDirty && !isSubmitting;

  const handleFormSubmit = async (values: ProfileEditValues) => {
    Keyboard.dismiss();
    setSavedNotice(false);

    try {
      if (onSave) {
        await onSave(values);
      } else {
        await new Promise<void>((resolve) => setTimeout(resolve, 400));
      }
      reset(values);
      setSavedNotice(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to save profile right now.';
      setError('root', { type: 'server', message });
    }
  };

  const submitForm = (): void => {
    void handleSubmit(handleFormSubmit)();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Profile</Text>

          {errors.root?.message ? (
            <View
              style={styles.errorBanner}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.errorBannerText}>{errors.root.message}</Text>
            </View>
          ) : null}

          {savedNotice ? (
            <View
              style={styles.successBanner}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.successBannerText}>Profile updated successfully.</Text>
            </View>
          ) : null}

          {/* Display Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Display Name</Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.displayName && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Your public name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => usernameRef.current?.focus()}
                  accessibilityLabel="Display Name"
                  accessibilityHint="Enter 2 to 40 characters"
                />
              )}
            />
            {errors.displayName?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.displayName.message}
              </Text>
            ) : null}
          </View>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={usernameRef}
                  style={[styles.input, errors.username && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="handle_name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => bioRef.current?.focus()}
                  accessibilityLabel="Username"
                  accessibilityHint="3 to 20 characters using letters, numbers, or underscores"
                />
              )}
            />
            {errors.username?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.username.message}
              </Text>
            ) : null}
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Bio</Text>
              <Text
                style={[
                  styles.charCounter,
                  bioValue.length > BIO_MAX_LENGTH && styles.charCounterOver,
                ]}
              >
                {bioValue.length}/{BIO_MAX_LENGTH}
              </Text>
            </View>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={bioRef}
                  style={[styles.input, styles.multilineInput, errors.bio && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Tell others what you are building"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => websiteRef.current?.focus()}
                  accessibilityLabel="Bio"
                  accessibilityHint="Short introduction up to 160 characters"
                />
              )}
            />
            {errors.bio?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.bio.message}
              </Text>
            ) : null}
          </View>

          {/* Website */}
          <View style={styles.field}>
            <Text style={styles.label}>Website (Optional)</Text>
            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={websiteRef}
                  style={[styles.input, errors.website && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="https://your-portfolio.dev"
                  placeholderTextColor="#94A3B8"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                  onSubmitEditing={submitForm}
                  accessibilityLabel="Website"
                  accessibilityHint="Optional link starting with https://"
                />
              )}
            />
            {errors.website?.message ? (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {errors.website.message}
              </Text>
            ) : null}
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                !isDirty && styles.buttonDisabled,
                pressed && isDirty && styles.buttonPressed,
              ]}
              onPress={() => {
                setSavedNotice(false);
                reset(initialValues);
              }}
              disabled={!isDirty || isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Reset Changes"
              accessibilityState={{ disabled: !isDirty || isSubmitting }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                !canSave && styles.buttonDisabled,
                pressed && canSave && styles.buttonPressed,
              ]}
              onPress={submitForm}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
              accessibilityState={{ disabled: !canSave, busy: isSubmitting }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
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
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  charCounter: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  charCounterOver: {
    color: '#DC2626',
    fontWeight: '700',
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
  multilineInput: {
    minHeight: 88,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  successBannerText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
