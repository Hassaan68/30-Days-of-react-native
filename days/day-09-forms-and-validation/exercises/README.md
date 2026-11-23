# Day 09 Exercises: Forms and Validation

Practice building accessible, schema-validated mobile forms with `react-hook-form`, `zod` v4, and `@hookform/resolvers/zod` on React Native 0.88.

## How to Practise

1. Open the starter file [`./ProfileEditFormExercise.tsx`](./ProfileEditFormExercise.tsx) and complete each `// TODO:` step in order.
2. Preview your form interactively via `npm start` in the shared Expo workspace (or import `ProfileEditFormExercise` inside a `SafeAreaProvider` in your Expo app) so you can test the virtual keyboard on iOS Simulator or Android Emulator.
3. Verify strict TypeScript and ESLint after each task:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### Exercise 1 (Beginner): Define the Zod v4 Schema

**Requirements**
1. Strengthen `profileEditSchema` with:
   - `displayName`: trimmed string, `2` to `40` characters
   - `username`: trimmed string, `3` to `20` characters, matching `/^[a-zA-Z0-9_]+$/`
   - `bio`: trimmed string, maximum `160` characters
   - `website`: trimmed string piped into `z.union([z.literal(''), z.url('Please enter a valid URL starting with https:// or http://')])` so empty strings are allowed while non-empty strings must be valid URLs.
2. Keep `export type ProfileEditValues = z.infer<typeof profileEditSchema>;` so form values stay strictly synced with the schema.

**Acceptance Criteria**
- [ ] Single-character `displayName` fails validation with a clear message.
- [ ] `username` containing spaces or symbols like `@` fails regex validation.
- [ ] `bio` longer than 160 characters fails validation.
- [ ] `website` accepts `""` and `"https://reactnative.dev"`, and rejects `"not-a-url"`.

**Expected Behavior**
Blurring any invalid field (or submitting the form) surfaces the exact schema validation message beneath that field.

<details>
<summary>Hint</summary>

Use `.pipe(...)` after `.trim()` on `website` so accidental whitespace is stripped before the union checks `z.literal('')` or `z.url(...)`:
```ts
website: z
  .string()
  .trim()
  .pipe(z.union([z.literal(''), z.url('Please enter a valid URL starting with https:// or http://')])),
```

</details>

---

### Exercise 2 (Intermediate): Wire React Hook Form & Accessible Inputs

**Requirements**
1. Add controlled `<Controller>` + `<TextInput>` fields for `username`, `bio`, and `website`.
2. Configure appropriate mobile keyboard props:
   - `username`: `autoCapitalize="none"`, `autoCorrect={false}`
   - `bio`: `multiline`, `numberOfLines={3}`, `textAlignVertical="top"`
   - `website`: `keyboardType="url"`, `autoCapitalize="none"`, `autoCorrect={false}`
3. Use `watch('bio')` to render a live `{bioValue.length}/160` character counter next to the Bio label (highlighting it in red when length exceeds 160).
4. Add visible labels, `accessibilityLabel`, `accessibilityHint`, and error messages with `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"` for every field.

**Acceptance Criteria**
- [ ] All four fields (`displayName`, `username`, `bio`, `website`) are bound via `<Controller>`.
- [ ] Typing into `bio` updates the `{bioValue.length}/160` counter in real time.
- [ ] Every validation error renders with `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"`.

**Expected Behavior**
Editing the bio updates the counter live (for example, `55/160` → `165/160` in red) and blurring shows the 160-character limit error cleanly.

<details>
<summary>Hint</summary>

Destructure `watch` from `useForm<ProfileEditValues>({ ... })`, then call `const bioValue = watch('bio');`. Render the Bio label and counter inside a `flexDirection: 'row'`, `justifyContent: 'space-between'` header row above the multiline `TextInput`.

</details>

---

### Exercise 3 (Challenge): Keyboard Flow & Dirty-State Protection

**Requirements**
1. Chain keyboard focus from `displayName` → `username` → `bio` → `website` using **`useRef<TextInputInstance>(null)`** (importing `type TextInputInstance` from `'react-native'`), `returnKeyType="next"`, `submitBehavior="submit"`, and `onSubmitEditing={() => nextRef.current?.focus()}`.
2. On the final `website` input, set `returnKeyType="done"`, `submitBehavior="blurAndSubmit"`, and `onSubmitEditing={submitForm}` where `submitForm` wraps `void handleSubmit(handleFormSubmit)()`.
3. Destructure `isDirty` and `reset` from `useForm`:
   - Disable **Save Changes** when `!isDirty || isSubmitting` (and show an `ActivityIndicator` while submitting).
   - Add a **Reset** button (disabled when `!isDirty || isSubmitting`) that calls `reset(initialValues)` to revert unsaved edits.
   - After a successful save, call `reset(values)` and show an accessible `"Profile updated successfully."` banner.

**Acceptance Criteria**
- [ ] Uses `useRef<TextInputInstance>(null)` (NOT `useRef<TextInput>(null)`) and `submitBehavior` (NOT deprecated `blurOnSubmit`).
- [ ] Uses `submitForm` (`() => { void handleSubmit(handleFormSubmit)(); }`) on both `Pressable` `onPress` and `website` `onSubmitEditing`.
- [ ] **Save Changes** and **Reset** are disabled when the form has no unsaved edits (`!isDirty`).
- [ ] Tapping **Reset** restores `initialValues`; saving updates the baseline via `reset(values)` and shows a success banner.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
When the screen first loads, **Save Changes** and **Reset** appear dimmed and disabled. Modifying Display Name enables both buttons; pressing **Next** on the keyboard glides through every input and pressing **Done** on Website saves the form, dismisses the keyboard, and displays the green confirmation banner.

<details>
<summary>Hint</summary>

Import `type TextInputInstance` from `'react-native'` and declare:
```ts
const usernameRef = useRef<TextInputInstance>(null);
const bioRef = useRef<TextInputInstance>(null);
const websiteRef = useRef<TextInputInstance>(null);
```
Remember to pass `ref={usernameRef}` inside `<Controller>`'s `render` callback on the `<TextInput>` element, and compute `const canSave = isDirty && !isSubmitting;`.

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to open the reference solution link</summary>

Once you have finished all three levels and verified `npm run typecheck` and `npm run lint`, compare your implementation with [`../solutions/ProfileEditFormSolution.tsx`](../solutions/ProfileEditFormSolution.tsx).

</details>
