# Day 07 Exercises: Build Your First Mobile App

Extend the Week 1 Developer Profile app by building modular, reusable profile sections with interactive state and Light/Dark theme support.

## How to Practise

1. Open the starter file [`./ProfileSectionExercise.tsx`](./ProfileSectionExercise.tsx). It compiles cleanly with strict TypeScript and ESLint and includes `// TODO:` markers for each exercise level.
2. Preview your screen interactively using `npm start` in the shared Expo workspace (or import `ProfileSectionExercise` into your Expo app).
3. Run type and lint checks after each milestone:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### Exercise 1 (Beginner): Featured Projects Card List

**Requirements**
1. Render each item in `PROJECTS` inside a styled card showing its `name`, `tagline`, `platform` badge (`iOS & Android` or `Expo Universal`), and live star count (`baseStars + (isStarred ? 1 : 0)`).
2. Add a `"Star"` / `"Starred"` `Pressable` button with pressed feedback and `hitSlop={6}` that toggles whether the user has starred that project.
3. Compute a derived `totalStars` summary (no extra `useState`!) to display on the Overview tab.

**Acceptance Criteria**
- [ ] Every project card displays its name, tagline, styled platform pill, and accurate star count.
- [ ] Tapping `"Star"` increments the count by 1 and highlights the button; tapping again reverts it.
- [ ] `totalStars` is derived dynamically from `PROJECTS` and `starredIds` (never stored in separate state).

**Expected Behavior**
Starring `"Pulse Weather"` changes its count from `142` to `143` and highlights the button in the active theme primary color.

<details>
<summary>Hint</summary>

Check `const isStarred = starredIds.includes(project.id);` inside `PROJECTS.map(...)` and compute `totalStars` with `PROJECTS.reduce((sum, project) => sum + project.baseStars + (starredIds.includes(project.id) ? 1 : 0), 0)`.

</details>

---

### Exercise 2 (Intermediate): Theme-Aware Reusable `SectionCard` & Availability Toggle

**Requirements**
1. Extract a reusable `SectionCard` component accepting `title`, `colors`, and `children: ReactNode` so every section shares consistent padding, radius, border, and surface colors.
2. Define full `LIGHT_COLORS` and `DARK_COLORS` palettes driven by `useColorScheme()`.
3. Render a colored availability status pill in the header (`"Available for Hire"` in green tones vs. `"Focused on Building"` in amber tones) controlled by an interactive toggle button.
4. Keep the screen wrapped in `SafeAreaProvider` and `SafeAreaView` from `react-native-safe-area-context`.

**Acceptance Criteria**
- [ ] `SectionCard` is reused for Overview cards and Project cards.
- [ ] Switching the device/simulator between Light and Dark Mode updates background, card surfaces, borders, pills, inputs, and text colors cleanly.
- [ ] Toggling availability updates both the pill text and pill color scheme immediately.

**Expected Behavior**
In Dark Mode, every card surface shifts to dark slate with crisp light text, and toggling status flips the header badge smoothly between green (`Available for Hire`) and amber (`Focused on Building`).

<details>
<summary>Hint</summary>

Create a typed `interface ThemeColors` with semantic tokens (`background`, `surface`, `surfaceMuted`, `border`, `textPrimary`, `textSecondary`, `primary`, `primaryText`, `successBg`, `successText`, `amberBg`, `amberText`) and select `const colors = colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;`.

</details>

---

### Exercise 3 (Challenge): Interactive Screen Switching & Editable Bio Modal

**Requirements**
1. Style the 2-tab segmented switcher (`"Overview"` and `"Projects (2)"`) with clear active-tab styling, `accessibilityRole="tab"`, and `accessibilityState={{ selected: isActive }}`.
2. Polish the `"Edit Bio"` `Modal` (`animationType="slide"`, `transparent`, `onRequestClose={() => setIsEditModalOpen(false)}`) with a theme-aware multiline `TextInput` (`maxLength={200}`), `"Cancel"` button, and `"Save Bio"` button.
3. Ensure saving trims whitespace, ignores empty submissions, and preserves all state (bio + starred projects) when switching between tabs.

**Acceptance Criteria**
- [ ] Active tab is visually distinct in both Light and Dark themes and exposes `accessibilityState={{ selected }}`.
- [ ] Opening `"Edit Bio"` pre-fills the input with the current `bio`; tapping `"Cancel"` discards unsaved edits.
- [ ] Tapping `"Save Bio"` updates the displayed bio on the Overview tab and closes the modal; tapping Android Back triggers `onRequestClose`.
- [ ] Switching from Overview → Projects → Overview preserves both starred projects and the updated bio.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
Edit your bio to `"Shipping Project 01 with Expo SDK 58!"`, tap **Save Bio**, switch to the **Projects** tab, star a project, and return to **Overview**—your new bio and updated total star count both remain intact.

<details>
<summary>Hint</summary>

Reset `setDraftBio(bio)` inside `openEditBio()` every time the modal opens so cancelled edits don't linger the next time the user opens the modal. Set `textAlignVertical: 'top'` on the multiline `TextInput` so Android starts typing at the top edge instead of vertically centered.

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to open the reference solution link</summary>

Once you have completed the exercises and verified `npm run typecheck` and `npm run lint`, compare your work with [`../solutions/ProfileSectionSolution.tsx`](../solutions/ProfileSectionSolution.tsx).

</details>
