import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Keyboard,
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
import { z } from 'zod';

// TODO (Beginner): Strengthen the Zod v4 validation rules:
// - displayName: 2-40 chars (trimmed)
// - username: 3-20 chars, letters/numbers/underscores only
// - bio: max 160 chars
// - website: empty string OR valid URL via z.union([z.literal(''), z.url('...')])
export const profileEditSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required'),
  username: z.string().trim().min(1, 'Username is required'),
  bio: z.string(),
  website: z.string(),
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
 * Exercise: Complete the Profile Edit form with Zod v4 validation,
 * accessible error feedback, live bio character counter, keyboard chaining,
 * and dirty-state Save/Reset controls.
 */
export default function ProfileEditFormExercise({
  initialValues = DEFAULT_PROFILE,
  onSave,
}: ProfileEditFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  const handleFormSubmit = async (values: ProfileEditValues) => {
    Keyboard.dismiss();
    if (onSave) {
      await onSave(values);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Profile</Text>

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
                  accessibilityLabel="Display Name"
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

          {/* TODO (Intermediate): Add controlled inputs for username, bio (with 160-char counter), and website */}

          {/* TODO (Challenge): Chain keyboard refs, disable Save when !isDirty, and add a Reset button */}
          <Pressable
            style={styles.saveButton}
            onPress={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Save Changes"
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  field: {
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
  saveButton: {
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
});
