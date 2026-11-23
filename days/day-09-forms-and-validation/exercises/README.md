# Day 09 Exercises: Forms and Validation

Practice building accessible, schema-validated forms with `react-hook-form`, `zod` v4, and `@hookform/resolvers/zod`.

## Starter File

Open [ProfileEditFormExercise.tsx](./ProfileEditFormExercise.tsx) and complete all `TODO` items.

## Tasks

1. **Beginner — Define the Zod v4 Schema**:
   - Complete `profileEditSchema` with:
     - `displayName`: trimmed string, 2 to 40 characters
     - `username`: trimmed string, 3 to 20 characters, matching `/^[a-zA-Z0-9_]+$/`
     - `bio`: trimmed string, maximum 160 characters
     - `website`: either an empty string `""` or a valid URL using `z.union([z.literal(''), z.url('...')])`

2. **Intermediate — Wire React Hook Form & Accessible Inputs**:
   - Connect `useForm<ProfileEditValues>` with `zodResolver(profileEditSchema)` and `initialValues`.
   - Render controlled `TextInput` fields via `<Controller>` with accessible labels, `accessibilityHint`, and `accessibilityLiveRegion="polite"` error text.
   - Add a live character counter (`{bioValue.length}/160`) under the `bio` multiline input.

3. **Challenge — Keyboard Flow & Dirty-State Protection**:
   - Chain keyboard focus from `displayName` → `username` → `bio` → `website` using `useRef<TextInput>` and `onSubmitEditing`.
   - Disable the **Save Changes** button while `!isDirty || isSubmitting` so users cannot submit unchanged data or trigger duplicate saves, and add a **Reset** button that reverts edits back to `initialValues`.

## Checking Your Work

Compare your implementation with [ProfileEditFormSolution.tsx](../solutions/ProfileEditFormSolution.tsx) and run:

```bash
npm run typecheck
npm run lint
```
