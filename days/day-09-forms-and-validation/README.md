# Day 09: Forms and Validation

## Learning Objectives

By the end of Day 09, you will be able to:

- Design ergonomic mobile forms using controlled `TextInput` fields and appropriate mobile keyboard types.
- Manage form state, validation, submission, and server errors cleanly with **React Hook Form** (`useForm`, `Controller`).
- Define strongly typed validation schemas with **Zod v4** and connect them using `zodResolver` from `@hookform/resolvers/zod`.
- Handle mobile keyboard ergonomics with `KeyboardAvoidingView`, `ScrollView` (`keyboardShouldPersistTaps="handled"`), `returnKeyType`, `submitBehavior`, `onSubmitEditing`, and `Keyboard.dismiss()`.
- Build accessible forms with clear labels, `accessibilityHint`, `accessibilityRole`, `accessibilityState`, and `accessibilityLiveRegion="polite"` error announcements.

## Prerequisites

- Completed [Day 08: Navigation with Expo Router](../day-08-navigation-expo-router/README.md).
- Comfortable with React hooks (`useState`, `useRef`) and TypeScript type inference.
- Familiar with `TextInput`, `Pressable`, and `ScrollView` from Day 06.

## Introduction

Forms are where users sign up, update their profile, enter payment details, or submit feedback—and on a small touchscreen with an on-screen keyboard, even minor form friction leads users to abandon a flow.

Managing five or six `useState` calls plus manual regex checks quickly turns into repetitive, error-prone code that re-renders the entire screen on every keystroke. Combining **React Hook Form** with **Zod v4** gives you declarative, single-source-of-truth validation, automatic TypeScript type inference (`z.infer`), minimal re-renders, and clean handling for both client-side and server-side errors.

## Concepts

### 1. Mobile Form Design Essentials

Mobile keyboards are slower and more error-prone than physical keyboards. Always configure `TextInput` hints to match the expected data:

- **Email**: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoCorrect={false}`, `autoComplete="email"`, `textContentType="emailAddress"`.
- **Passwords**: `secureTextEntry`, `autoCapitalize="none"`, `autoComplete="new-password"` (or `"current-password"`).
- **URLs**: `keyboardType="url"`, `autoCapitalize="none"`, `autoCorrect={false}`.
- **Names**: `autoCapitalize="words"`, `autoComplete="name"`.

### 2. React Hook Form (`useForm` + `Controller`)

Unlike web HTML `<input {...register('email')} />`, React Native's `<TextInput>` does not expose a DOM `value`/`onChange` event. Instead, you wrap each native input in React Hook Form's `<Controller>`:

```tsx
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
    />
  )}
/>
```

`useForm` also exposes:
- `handleSubmit(onValid)` — runs validation before calling your submit callback.
- `setError('email', { type: 'server', message: '...' })` or `setError('root', ...)` — attaches backend errors to a field or top-level banner.
- `reset(values)` — clears or updates default values and resets `isDirty`.
- `formState` (`errors`, `isDirty`, `isSubmitting`) — drives disabled states, loading spinners, and error feedback.

### 3. Schema Validation with Zod v4 & `zodResolver`

**Zod v4** lets you describe both runtime validation rules and compile-time TypeScript types in one schema:

```ts
export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().pipe(z.email('Please enter a valid email address')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
```

Key Zod v4 highlights:
- Top-level format validators like `z.email(...)` and `z.url(...)` provide crisp, dedicated validation.
- Chaining `z.string().trim().pipe(z.email('...'))` trims accidental mobile-keyboard trailing spaces before validating the email format while keeping both input and output types strictly `string`.
- Avoid `.default()` or type-changing `.transform()` inside schemas passed to `zodResolver`; keep `z.input<typeof schema>` equal to `z.output<typeof schema>` and supply defaults via `useForm({ defaultValues })` so TypeScript types line up cleanly.

### 4. Keyboard Management on iOS & Android

Good keyboard UX makes a form feel genuinely native:

- Wrap scrollable forms in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`.
- Add `keyboardShouldPersistTaps="handled"` to `<ScrollView>` so tapping the Submit button while the keyboard is open triggers submission on the **first** tap instead of only dismissing the keyboard.
- Chain inputs with `useRef<TextInput>(null)`: set `returnKeyType="next"`, `submitBehavior="submit"` (the modern replacement for deprecated `blurOnSubmit`), and `onSubmitEditing={() => nextRef.current?.focus()}`.
- On the final input, set `returnKeyType="done"`, `submitBehavior="blurAndSubmit"`, and `onSubmitEditing={handleSubmit(onSubmit)}`.
- Call `Keyboard.dismiss()` at the start of `onSubmit`.

### 5. Accessible Form Controls & Live Error Announcements

Make every form usable with VoiceOver (iOS) and TalkBack (Android):

- Always render a **visible `<Text>` label** above the input (placeholders disappear as soon as the user types).
- Set `accessibilityLabel` and `accessibilityHint` on each `TextInput`.
- Render error messages with `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"` so screen readers announce validation errors without interrupting the user abruptly.
- On custom checkboxes/toggles, set `accessibilityRole="checkbox"` and `accessibilityState={{ checked: value }}`.
- On submit buttons, pass `accessibilityRole="button"` and `accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}`.

## Code Examples

Review the complete runnable example for this day:

- **[examples/SignUpForm.tsx](./examples/SignUpForm.tsx)** — Full sign-up form with Zod v4 cross-field password confirmation, terms checkbox, simulated server-side email conflict error via `setError`, keyboard focus chaining, and screen-reader accessibility.

```tsx
const {
  control,
  handleSubmit,
  setError,
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
```

## Step-by-Step Explanation

1. **Define the Zod v4 schema first**: Writing `signUpSchema` outside the component keeps the schema referentially stable and makes it reusable in unit tests and API layers.
2. **Derive the TypeScript type with `z.infer`**: `type SignUpFormValues = z.infer<typeof signUpSchema>` guarantees your form values, `defaultValues`, and `onSubmit` handler never drift out of sync.
3. **Validate on blur (`mode: 'onBlur'`)**: Validating only after a user leaves a field (and re-validating on change once an error appears) avoids shouting red errors before the user finishes typing their email.
4. **Chain focus with `TextInput` refs**: Storing `emailRef`, `passwordRef`, and `confirmPasswordRef` lets users glide through the entire form using the keyboard's **Next** and **Done** keys.
5. **Surface server errors cleanly**: Field-specific backend failures (like an already-registered email) attach directly to `setError('email', ...)`, while unexpected network errors surface in a top-level `errors.root` alert banner.

## Common Mistakes

- **Using Placeholders as Labels**: Placeholders vanish once typing starts, hurting usability and accessibility. Always pair inputs with visible labels.
- **Forgetting `keyboardShouldPersistTaps="handled"`**: Without it, users inside a `ScrollView` have to tap the Submit button twice—once to dismiss the keyboard and a second time to submit.
- **Using Deprecated `blurOnSubmit`**: In modern React Native (0.88), prefer `submitBehavior="submit"` (keep focus/advance to next field) or `submitBehavior="blurAndSubmit"`.
- **Validating Aggressively on Every Keystroke Before First Blur**: Setting `mode: 'onChange'` makes an email input show "Invalid email" after typing the very first letter `'a'`. Prefer `mode: 'onBlur'` or `mode: 'onTouched'`.
- **Allowing Double Submissions**: Always disable the submit `Pressable` while `isSubmitting` is `true` and display an `ActivityIndicator`.

## Best Practices

- **Keep Schemas Pure and Reusable**: Export your Zod schemas so you can test validation logic directly in Jest without rendering the whole screen.
- **Use `z.union([z.literal(''), z.url(...)])` for Optional Text Fields**: Because React Native `TextInput` binds to strings (`""`), validating empty string OR valid URL keeps TypeScript types clean without `undefined` warnings.
- **Guard Edits with `isDirty`**: On edit screens (like Edit Profile), disable the **Save** button until `isDirty` is `true`, and offer a **Reset** button that restores `initialValues`.
- **Handle Both Field Errors and Root Errors**: Always catch thrown errors in `onSubmit` and surface a friendly, actionable message instead of failing silently.
- **Trim User Input**: Mobile keyboards frequently append trailing spaces after autocomplete; `.trim()` prevents frustrating false validation failures.

## Exercises

Head to [exercises/README.md](./exercises/README.md) and open [exercises/ProfileEditFormExercise.tsx](./exercises/ProfileEditFormExercise.tsx).

### Beginner
Complete `profileEditSchema` in Zod v4 with length rules for `displayName` (2–40 chars), regex validation for `username` (3–20 alphanumeric/underscore chars), a 160-character limit for `bio`, and an optional URL rule for `website` using `z.union([z.literal(''), z.url('...')])`.

### Intermediate
Add controlled `TextInput` fields for `username`, `bio` (multiline with a live `{bioValue.length}/160` character counter using `watch('bio')`), and `website`, complete with accessible labels, hints, and polite live-region error messages.

### Challenge
Chain keyboard focus across all four fields (`displayName` → `username` → `bio` → `website`), disable the **Save Changes** button unless `isDirty && !isSubmitting`, and add a **Reset** button that reverts unsaved edits back to `initialValues`.

## Solutions

Compare your work with the complete reference solution:

- **[solutions/ProfileEditFormSolution.tsx](./solutions/ProfileEditFormSolution.tsx)** — Full profile editor implementing the Zod v4 schema, live character counter, keyboard focus chaining, dirty-state Save/Reset controls, and accessible error/success banners.

## Mini Project

**Feedback & Bug Report Form**: Build a 4-field feedback form screen (`title`, `category` selector using Pressable pills, `description` multiline input with 300-char counter, and optional `contactEmail`) validated with Zod v4 + React Hook Form:

1. Show a confirmation banner when submission succeeds and reset the form cleanly.
2. Simulate a 500ms async submission with a disabled loading state on the Submit button.
3. Verify keyboard avoidance and Next/Done focus chaining on both an iOS Simulator and Android Emulator.

## Key Takeaways

- React Hook Form + Zod v4 (`zodResolver`) gives you fast, type-safe mobile forms with minimal boilerplate.
- Use `<Controller>` to bind native `TextInput` and custom controls (like checkboxes) to React Hook Form.
- `KeyboardAvoidingView`, `keyboardShouldPersistTaps="handled"`, `submitBehavior`, and `TextInput` ref chaining turn clunky mobile forms into effortless experiences.
- Always pair visible labels, `accessibilityHint`, and `accessibilityLiveRegion="polite"` error messages so every user can complete your forms.

## Further Reading

- [React Hook Form Documentation — React Native](https://react-hook-form.com/get-started#ReactNative)
- [Zod v4 Documentation](https://zod.dev/)
- [React Native `TextInput` API](https://reactnative.dev/docs/textinput)
- [React Native `KeyboardAvoidingView` API](https://reactnative.dev/docs/keyboardavoidingview)

## Progress Checklist

- [ ] Built a controlled mobile form with `useForm` and `<Controller>`
- [ ] Wrote a Zod v4 validation schema and connected it with `zodResolver`
- [ ] Implemented cross-field validation (password confirmation) and server error attachment (`setError`)
- [ ] Configured keyboard avoidance and focus chaining with `submitBehavior` and `onSubmitEditing`
- [ ] Added accessible labels, hints, and `accessibilityLiveRegion="polite"` error messages
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `exercises/ProfileEditFormExercise.tsx`

## Next Day

Continue to [Day 10: State Management](../day-10-state-management/README.md) to learn how to architect local state, React Context, and Zustand v5 with AsyncStorage persistence.
