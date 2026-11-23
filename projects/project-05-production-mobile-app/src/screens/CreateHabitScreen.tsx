import { useState } from 'react';
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

import {
  createHabitSchema,
  HABIT_CATEGORIES,
  HABIT_FREQUENCIES,
  type CreateHabitFormValues,
} from '../features/habits/habitSchema';
import { useHabitStore } from '../features/habits/useHabitStore';

export interface CreateHabitScreenProps {
  onCreated?: () => void;
}

const DURATION_PRESETS: readonly number[] = [15, 25, 45, 60];

function capitalize(value: string): string {
  const first = value[0];
  if (!first) {
    return value;
  }
  return `${first.toUpperCase()}${value.slice(1)}`;
}

export function CreateHabitScreen({ onCreated }: CreateHabitScreenProps) {
  const addHabit = useHabitStore((state) => state.addHabit);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHabitFormValues>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      title: '',
      notes: '',
      category: 'focus',
      frequency: 'daily',
      targetMinutes: 25,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: CreateHabitFormValues): Promise<void> => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await addHabit(values);
      reset();
      setStatusMessage(`Saved "${values.title}" to your focus tracker.`);
      onCreated?.();
    } catch {
      setStatusMessage('Unable to save habit right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
          <Text style={styles.title} accessibilityRole="header">
            Create Focus Habit
          </Text>
          <Text style={styles.subtitle}>
            Define a clear habit, category, and daily focus duration. Habits are stored offline-first
            on your device.
          </Text>

          {statusMessage ? (
            <View style={styles.statusBanner} accessibilityLiveRegion="polite">
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Habit Title</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title ? styles.inputError : undefined]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. Morning Deep Work Sprint"
                    placeholderTextColor="#94A3B8"
                    maxLength={60}
                    accessibilityLabel="Habit title"
                  />
                )}
              />
              {errors.title?.message ? (
                <Text style={styles.fieldError}>{errors.title.message}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      errors.notes ? styles.inputError : undefined,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="What makes a session successful?"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                    textAlignVertical="top"
                    accessibilityLabel="Habit notes"
                  />
                )}
              />
              {errors.notes?.message ? (
                <Text style={styles.fieldError}>{errors.notes.message}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipGrid}>
                    {HABIT_CATEGORIES.map((category) => {
                      const selected = value === category;
                      return (
                        <Pressable
                          key={category}
                          onPress={() => onChange(category)}
                          style={[styles.chip, selected ? styles.chipSelected : undefined]}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                        >
                          <Text
                            style={[styles.chipText, selected ? styles.chipTextSelected : undefined]}
                          >
                            {capitalize(category)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Frequency</Text>
              <Controller
                control={control}
                name="frequency"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipRow}>
                    {HABIT_FREQUENCIES.map((frequency) => {
                      const selected = value === frequency;
                      return (
                        <Pressable
                          key={frequency}
                          onPress={() => onChange(frequency)}
                          style={[styles.chipFlex, selected ? styles.chipSelected : undefined]}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                        >
                          <Text
                            style={[styles.chipText, selected ? styles.chipTextSelected : undefined]}
                          >
                            {capitalize(frequency)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Target Focus Duration</Text>
              <Controller
                control={control}
                name="targetMinutes"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.durationContainer}>
                    <View style={styles.stepperRow}>
                      <Pressable
                        onPress={() => onChange(Math.max(5, value - 5))}
                        style={styles.stepperButton}
                        accessibilityRole="button"
                        accessibilityLabel="Decrease target minutes by 5"
                      >
                        <Text style={styles.stepperButtonText}>-5m</Text>
                      </Pressable>
                      <Text style={styles.durationValue}>{value} minutes</Text>
                      <Pressable
                        onPress={() => onChange(Math.min(180, value + 5))}
                        style={styles.stepperButton}
                        accessibilityRole="button"
                        accessibilityLabel="Increase target minutes by 5"
                      >
                        <Text style={styles.stepperButtonText}>+5m</Text>
                      </Pressable>
                    </View>
                    <View style={styles.chipRow}>
                      {DURATION_PRESETS.map((minutes) => {
                        const selected = value === minutes;
                        return (
                          <Pressable
                            key={minutes}
                            onPress={() => onChange(minutes)}
                            style={[styles.chipFlex, selected ? styles.chipSelected : undefined]}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                selected ? styles.chipTextSelected : undefined,
                              ]}
                            >
                              {minutes}m
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
              />
              {errors.targetMinutes?.message ? (
                <Text style={styles.fieldError}>{errors.targetMinutes.message}</Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => {
                void handleSubmit(onSubmit)();
              }}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !isSaving ? styles.submitButtonPressed : undefined,
                isSaving ? styles.submitButtonDisabled : undefined,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save habit"
              accessibilityState={{ disabled: isSaving, busy: isSaving }}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Save Habit</Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  statusBanner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  statusText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  form: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
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
  textArea: {
    minHeight: 92,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  fieldError: {
    fontSize: 13,
    color: '#DC2626',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipFlex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  durationContainer: {
    gap: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  stepperButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 14,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
