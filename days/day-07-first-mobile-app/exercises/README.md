# Day 07 Exercises: Build Your First Mobile App

Extend the Week 1 Developer Profile app by building modular, reusable profile sections with interactive state and Light/Dark theme support.

## Starter File

Open [`./ProfileSectionExercise.tsx`](./ProfileSectionExercise.tsx). It compiles cleanly with strict TypeScript and ESLint and includes `// TODO:` markers for each exercise level.

## Tasks

### Exercise 1 (Beginner): Featured Projects Card List
1. Render each item in `PROJECTS` inside a styled card showing its `name`, `tagline`, `platform` badge, and current star count.
2. Add a `"Star"` `Pressable` button on every project card that toggles whether the user has starred that project and increments/decrements the displayed star count.

### Exercise 2 (Intermediate): Theme-Aware Reusable `SectionCard` & Availability Toggle
1. Support Light and Dark mode using `useColorScheme()`.
2. Add an interactive availability switch (`"Available for Hire"` vs. `"Focused on Building"`) that updates a status pill in the profile header.
3. Wrap the screen in `SafeAreaProvider` and `SafeAreaView` from `react-native-safe-area-context`.

### Exercise 3 (Challenge): Interactive Screen Switching & Editable Bio Modal
1. Add a 2-tab switcher (`"Overview"` and `"Projects"`) at the top or bottom of the screen to practice state-driven multi-screen composition before Day 08's Expo Router lesson.
2. Add an `"Edit Bio"` button on the Overview tab that opens a `Modal` (`animationType="slide"`) containing a multiline `TextInput`, a `"Cancel"` button, and a `"Save Bio"` button that updates the profile bio in state.

## Verification Checklist

- [ ] Project starring toggles cleanly and updates star counts accurately
- [ ] Light and Dark themes adapt all surfaces, borders, and text colors
- [ ] Screen switching between Overview and Projects preserves state (starred projects & updated bio)
- [ ] Bio edit modal dismisses on Save, Cancel, and Android Back (`onRequestClose`)
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors

Compare your finished work with [`../solutions/ProfileSectionSolution.tsx`](../solutions/ProfileSectionSolution.tsx).
