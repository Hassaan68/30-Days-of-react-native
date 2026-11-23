# Assets

This directory holds repository graphics and documents standard asset conventions for Expo and React Native apps.

## Included Repository Assets

- [`images/banner.svg`](./images/banner.svg) — Header banner used in the root README.

## Standard Expo App Assets

When you generate a new app with `npx create-expo-app@latest`, Expo expects static images (icons, splash screen graphics, favicons) in `assets/images/`:

| Asset | Recommended Size | Purpose |
| ----- | ---------------- | ------- |
| `icon.png` | `1024 × 1024` px (PNG, no transparency for iOS) | App Store & home screen icon |
| `adaptive-icon.png` | `1024 × 1024` px (safe center `66%`) | Android adaptive icon foreground |
| `splash-icon.png` | `1024 × 1024` px | Native splash screen graphic via `expo-splash-screen` |
| `favicon.png` | `48 × 48` px | Web tab favicon |

Learn more in the [Expo App Icons & Splash Screen documentation](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/).
