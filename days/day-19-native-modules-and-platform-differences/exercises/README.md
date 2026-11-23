# Day 19 Exercises: Platform Differences & Native Adaptation

## Goal

Practice writing components that look and feel native on both iOS and Android without duplicating entire screens.

## Starter File

Open [`PlatformCardExercise.tsx`](./PlatformCardExercise.tsx) and complete all `TODO` items.

### Tasks

1. **Platform-specific elevation (`getCardDepthStyle`)**:
   - Return iOS shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) on iOS.
   - Return Material `elevation` on Android.
   - Return a safe fallback via `Platform.select({ ios: ..., android: ..., default: ... })`.
2. **Platform badge label (`getPlatformBadgeText`)**:
   - Use `Platform.select` to return `'iOS Native'`, `'Android Material'`, or `'Cross-Platform'`.
3. **Platform-idiomatic touch feedback**:
   - Use `android_ripple` on `Pressable` for Android touch feedback.
   - Apply subtle opacity reduction when `pressed` is `true` on iOS.
   - Ensure `overflow: 'hidden'` is set so Android's ripple stays inside rounded card corners.
4. **Dark mode support**:
   - Use `useColorScheme()` to adjust background, border, and text colors for light and dark themes.

## Verification

- Run `npm run typecheck` to confirm there are zero TypeScript errors.
- Run `npm run lint` to confirm there are zero ESLint errors.
- Compare your completed component with [`../solutions/PlatformCardSolution.tsx`](../solutions/PlatformCardSolution.tsx).
