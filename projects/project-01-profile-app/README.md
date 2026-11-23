# Project 01: Developer Profile App

> **Aligned with:** [Day 07: Build Your First Complete Mobile App](../../days/day-07-first-mobile-app/README.md)  
> **Difficulty:** Beginner  
> **Estimated Time:** 2–3 hours

## Project Overview

The **Developer Profile App** is your first complete multi-screen React Native application. It brings together everything learned during Week 1—strict TypeScript modeling, React Hooks, Flexbox layout, `StyleSheet.create`, core React Native components (`View`, `Text`, `Image`, `ScrollView`, `Pressable`, `Linking`), dark mode awareness, and safe area handling with `react-native-safe-area-context`.

Rather than building a static business card, you will create an interactive developer portfolio app with live state updates, category-filtered skill badges, an expandable skill summary panel, external profile links, and a dedicated About & Experience screen.

## Features

- **Hero Profile Header**: Displays developer avatar, availability status badge, name, role title, location, headline, and live follower count.
- **Interactive Follow Toggle**: Lets visitors follow or unfollow the profile with instant visual and numeric state updates.
- **Category-Filtered Skill Explorer**: Filter skills across `All`, `Mobile`, `Frontend`, `Backend`, and `Tools` using horizontal filter chips and interactive [`SkillBadge`](./src/components/SkillBadge.tsx) pills.
- **Selected Skill Detail Card**: Tapping any skill badge reveals years of experience and a short summary of production expertise.
- **Safe External Linking**: Opens GitHub, LinkedIn, portfolio, and `mailto:` links using `Linking.canOpenURL` and `Linking.openURL` with graceful error handling.
- **Two-Screen Experience**: Smooth segmented navigation between the main **Profile** view and the **About & Experience** view—deliberately built with local state before introducing Expo Router on [Day 08](../../days/day-08-navigation-expo-router/README.md).
- **Light & Dark Mode Support**: Automatically adapts colors and status bar contrast using `useColorScheme()` and `expo-status-bar`.
- **Notch & Gesture Bar Safe Layout**: Uses `SafeAreaProvider` and `SafeAreaView` from `react-native-safe-area-context` (never the deprecated `SafeAreaView` from `react-native`).

## Technologies

| Tool / Library | Purpose |
| --- | --- |
| **React Native 0.88** | Core native UI primitives (`View`, `Text`, `Image`, `Pressable`, `ScrollView`, `Linking`) |
| **Expo SDK 58** | Managed mobile runtime and `expo-status-bar` |
| **React 19** | Functional components, `useState`, and `useMemo` |
| **TypeScript 5.8** | Strict data interfaces (`strict: true`, `noUncheckedIndexedAccess: true`) |
| **react-native-safe-area-context** | Reliable safe area insets across modern iOS and Android screens |

## Screens

1. **Profile Screen ([`src/screens/ProfileScreen.tsx`](./src/screens/ProfileScreen.tsx))**
   - Hero profile card with avatar, availability indicator, headline, Follow button, and stats row.
   - Core Skills section with category filter chips, interactive `SkillBadge` grid, and detail readout box.
   - Connect section listing external social links.
2. **About Screen ([`src/screens/AboutScreen.tsx`](./src/screens/AboutScreen.tsx))**
   - Full biography section.
   - Career experience timeline with roles, companies, dates, and bullet highlights.
   - Numbered list of engineering principles.
   - Direct email call-to-action button.

## Folder Structure

```text
projects/project-01-profile-app/
├── README.md
└── src/
    ├── App.tsx                       # Root SafeAreaProvider, theme awareness, and tab switcher
    ├── components/
    │   └── SkillBadge.tsx            # Reusable, accessible interactive skill pill
    ├── screens/
    │   ├── ProfileScreen.tsx         # Main profile, interactive skills, and social links
    │   └── AboutScreen.tsx           # Bio, career timeline, values, and contact CTA
    └── types/
        └── profile.ts                # Strictly typed DeveloperProfile domain models
```

## Implementation Steps

Follow these steps to build or study the project from scratch:

1. **Model the domain data first** ([`src/types/profile.ts`](./src/types/profile.ts))
   - Define narrow union types (`SkillCategory`, `SkillLevel`, `ActiveTab`) and `readonly` interfaces (`Skill`, `SocialLink`, `ExperienceItem`, `DeveloperProfile`).
   - Using strict types prevents typos in category filters and guarantees every required profile field is provided.
2. **Build reusable UI components** ([`src/components/SkillBadge.tsx`](./src/components/SkillBadge.tsx))
   - Use `Pressable` instead of legacy `TouchableOpacity` so you can style pressed states cleanly and supply `accessibilityRole="button"` plus `accessibilityState={{ selected }}`.
   - Map each `SkillCategory` to a consistent accent color via `Record<SkillCategory, string>`.
3. **Assemble the Profile screen** ([`src/screens/ProfileScreen.tsx`](./src/screens/ProfileScreen.tsx))
   - Manage `selectedCategory`, `selectedSkill`, and `isFollowing` with `useState`.
   - Derive `filteredSkills` using `useMemo` so filtering only recalculates when the category or skills list changes.
   - Guard indexed lookups like `profile.skills[0] ?? null` to satisfy TypeScript's `noUncheckedIndexedAccess` rule.
   - Always check `await Linking.canOpenURL(url)` inside a `try/catch` block before calling `Linking.openURL(url)`.
4. **Create the About & Experience screen** ([`src/screens/AboutScreen.tsx`](./src/screens/AboutScreen.tsx))
   - Render the biography, timeline items with a left accent border, engineering principles, and a `mailto:` button with fallback alerting if no mail client is configured (common on simulators).
5. **Connect everything in the root shell** ([`src/App.tsx`](./src/App.tsx))
   - Wrap the tree in `SafeAreaProvider` and `SafeAreaView` from `react-native-safe-area-context`.
   - Read the system color scheme with `useColorScheme()` and sync `<StatusBar style={isDarkMode ? 'light' : 'dark'} />`.
   - Render a clean segmented tab header that switches between `ProfileScreen` and `AboutScreen`.

## Complete Code Overview

| File | Responsibility | Key React Native Concepts |
| --- | --- | --- |
| [`src/types/profile.ts`](./src/types/profile.ts) | Defines profile, skill, social link, and experience interfaces | Strict TypeScript unions & `readonly` properties |
| [`src/components/SkillBadge.tsx`](./src/components/SkillBadge.tsx) | Renders an interactive skill chip with category accent dot | `Pressable`, dynamic style arrays, accessibility states |
| [`src/screens/ProfileScreen.tsx`](./src/screens/ProfileScreen.tsx) | Displays hero profile, stats, filtered skills, and external links | `ScrollView`, `Image`, `useMemo`, `Linking`, `Alert` |
| [`src/screens/AboutScreen.tsx`](./src/screens/AboutScreen.tsx) | Displays bio, work timeline, engineering values, and email CTA | Flexbox cards, list rendering, `mailto:` URL handling |
| [`src/App.tsx`](./src/App.tsx) | Root layout, sample dataset, light/dark styling, and tab switching | `SafeAreaProvider`, `SafeAreaView`, `useColorScheme`, `StatusBar` |

### Related Curriculum Lessons

- [Day 05: Styling & Layout](../../days/day-05-styling-and-layout/README.md)
- [Day 06: Core Components](../../days/day-06-core-components/README.md)
- [Day 07: First Mobile App](../../days/day-07-first-mobile-app/README.md)
- [Day 08: Navigation with Expo Router](../../days/day-08-navigation-expo-router/README.md)

## Testing Instructions

### 1. Static Verification (TypeScript & ESLint)

From the repository root, run:

```bash
npm run typecheck
npm run lint
```

Both commands check all files inside `projects/project-01-profile-app/src/` with strict TypeScript (`noUncheckedIndexedAccess: true`) and ESLint rules (`no-explicit-any`, `react-hooks`).

### 2. Run Inside an Expo App

To preview this project on a simulator or physical phone via Expo Go:

1. Import `App` from `./projects/project-01-profile-app/src/App` into your Expo entry screen (for example, `app/index.tsx` in a fresh Expo project).
2. Run `npm start` and open the app in iOS Simulator, Android Emulator, or Expo Go.

### 3. Manual QA Checklist

- [ ] Tap **Follow** and confirm the button toggles to **Following** and the follower count increments by 1.
- [ ] Switch between `All`, `Mobile`, `Frontend`, `Backend`, and `Tools` chips and confirm the skill list and skill detail box update cleanly.
- [ ] Tap individual `SkillBadge` items and confirm the active highlight and experience summary change.
- [ ] Tap **View Experience** (or the **About** tab) to switch to `AboutScreen` and scroll through the experience timeline.
- [ ] Toggle Dark Mode in your device or simulator settings and verify text contrast and card surfaces adapt cleanly.
- [ ] Tap an external social link and confirm it opens in the browser (or shows a helpful alert on unsupported environments).

## Future Improvements

- **Upgrade Navigation to Expo Router**: Convert the segmented tabs into real file-based routes with stack transitions after completing [Day 08](../../days/day-08-navigation-expo-router/README.md).
- **Editable Profile Mode**: Add an "Edit Profile" form powered by `react-hook-form` + `zod` ([Day 09](../../days/day-09-forms-and-validation/README.md)) and persist edits locally with `AsyncStorage` ([Day 17](../../days/day-17-local-storage-and-offline/README.md)).
- **Copy-to-Clipboard & Share Sheet**: Use `expo-clipboard` and `expo-sharing` ([Day 13](../../days/day-13-device-features/README.md)) so visitors can copy your email or share your profile card.
- **Component Tests**: Write React Native Testing Library tests ([Day 20](../../days/day-20-testing/README.md)) verifying follow counts and skill category filtering.
- **Next Featured Project**: Ready for live APIs and device GPS? Move on to [Project 02: Live Weather App](../project-02-weather-app/README.md).
