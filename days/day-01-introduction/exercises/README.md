# Day 01 Exercises: Build Your React Native Intro Card

Practice creating your first React Native screen using `SafeAreaView`, `View`, `Text`, `Pressable`, `Platform`, and `StyleSheet.create`.

## Starter File

Open [`./IntroCardExercise.tsx`](./IntroCardExercise.tsx) and complete the `// TODO:` steps below.

## Tasks

### 1. Beginner — Personalize the Intro Card
- Replace the placeholder name and goal with your own details.
- Render a list of at least **3 reasons** you are learning React Native inside the card.

### 2. Intermediate — Interactive Day 01 Check-In
- Wire up the `isCheckedIn` state so pressing the primary `<Pressable>` toggles check-in status.
- Update the button label and styling when checked in (for example, green background and `"Checked In — Day 01 Complete!"`).

### 3. Challenge — Platform Badge & Quote Cycler
- Display the current platform (`Platform.OS`) inside a styled badge.
- Add a second `<Pressable>` that cycles through 3 motivational quotes using modulo arithmetic (`(index + 1) % QUOTES.length`) and guards array indexing safely under `noUncheckedIndexedAccess`.
- Include `accessibilityRole="button"` and `accessibilityLabel` on both buttons.

## Checking Your Work

Compare your completed component with [`../solutions/IntroCardSolution.tsx`](../solutions/IntroCardSolution.tsx).
