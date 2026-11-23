import { z } from 'zod';

export const HABIT_CATEGORIES = ['focus', 'health', 'learning', 'mindfulness'] as const;

export const HABIT_FREQUENCIES = ['daily', 'weekdays', 'weekly'] as const;

export const createHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Habit title must be at least 2 characters')
    .max(60, 'Habit title must be 60 characters or fewer'),
  notes: z.string().trim().max(200, 'Notes must be 200 characters or fewer'),
  category: z.enum(HABIT_CATEGORIES),
  frequency: z.enum(HABIT_FREQUENCIES),
  targetMinutes: z
    .number()
    .int('Target duration must be a whole number')
    .min(5, 'Minimum focus duration is 5 minutes')
    .max(180, 'Maximum focus duration is 180 minutes'),
});

export type CreateHabitFormValues = z.infer<typeof createHabitSchema>;
