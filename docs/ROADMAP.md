# 30 Days of React Native — Curriculum Roadmap

Welcome to the complete 4-week roadmap for **30 Days of React Native**. This curriculum takes you from setting up your first Expo SDK 58 project to shipping an accessible, secure, tested, production-ready React Native 0.88 application written in strict TypeScript.

> **Technology Stack Verified:** November 23, 2026

---

## Verified Technology Stack

Every lesson, code example, exercise, and capstone project in this repository is aligned with the following verified versions:

| Tool / Library | Version | Role in Curriculum |
| --- | --- | --- |
| **Expo SDK** | `~58.0.0` (released October 15, 2026) | Managed workflow, native module ecosystem, EAS builds & updates |
| **React Native** | `0.88.0` | Cross-platform native UI runtime (New Architecture & Strict TypeScript API enabled by default) |
| **React** | `19.3.0` | Component model, hooks, concurrent rendering |
| **Expo Router** | `~58.0.0` | File-based navigation (stacks, tabs, modals, typed routes, deep links) |
| **TypeScript** | `~5.8.3` | Static typing (`strict: true`, `noUncheckedIndexedAccess: true`) |
| **Node.js** | `>=22.13.0` (`24` in `.nvmrc`) | JavaScript runtime for Expo CLI, Metro, Jest, and tooling |
| **Zustand** | `^5.1.0` | Lightweight global client state management |
| **TanStack Query** | `^5.90.0` | Server state caching, background refetching, and mutations |
| **React Hook Form + Zod** | `^7.55.0` / `^4.0.0` | Performant forms and schema-first runtime validation |
| **Reanimated + Gesture Handler** | `~3.17.4` / `~2.24.0` | 60–120 FPS UI-thread animations and native gestures |
| **AsyncStorage / SecureStore / SQLite** | `^2.1.2` / `~58.0.0` / `~58.0.0` | Key-value storage, encrypted secrets, and structured offline persistence |
| **Jest + RNTL** | `^29.7.0` / `^13.1.0` (`jest-expo ~58.0.0`) | Unit, component, and integration testing |

---

## Deprecated APIs Strictly Avoided

React Native 0.88 and Expo SDK 58 removed or deprecated several legacy APIs. You will **never** see these patterns used in this curriculum:

| Legacy / Deprecated API | Modern Replacement Used Here |
| --- | --- |
| `SafeAreaView` from `react-native` | `SafeAreaView` and `SafeAreaProvider` from `react-native-safe-area-context` |
| `AsyncStorage` from `react-native` | `@react-native-async-storage/async-storage` |
| `expo-av` | `expo-audio` and `expo-video` |
| `TouchableOpacity` (as default button) | `Pressable` with pressed/focused state feedback |
| `InteractionManager`, root `Touchable`, `NativeMethods` | React transitions, `Pressable`, and New Architecture host refs |
| `Modal` `animated` prop | `Modal` `animationType` (`"none"`, `"slide"`, `"fade"`) |
| Deep imports (`react-native/Libraries/*`) | Public package exports enforced by RN 0.88 Strict TypeScript API |
| Legacy `expo-file-system` sync/MD5 helpers | Async `File.write()` (or `File.writeSync()`) and `File.digest()` |

---

## Curriculum Overview

```text
Week 1 (Days 01–07) ──▶ Foundations, React 19, TypeScript & First Mobile App
Week 2 (Days 08–14) ──▶ Navigation, Forms, State, APIs, Auth, Device APIs & Weather App
Week 3 (Days 15–21) ──▶ Animations, Performance, Offline Storage, Architecture, Testing & Task Manager
Week 4 (Days 22–30) ──▶ Accessibility, Security, DevTools, Notifications, Realtime, CI/CD & Production Capstone
```

---

## Week 1: Foundations & Core UI (Days 01–07)

**Weekly Milestone:** Understand React Native's New Architecture, write strict TypeScript, master Flexbox mobile layouts, and ship your first complete multi-section mobile app.

| Day | Topic | Core Focus |
| --- | --- | --- |
| Day 01 | [Introduction to React Native & Expo](../days/day-01-introduction/README.md) | New Architecture (Fabric, JSI, Hermes), Expo SDK 58, running on simulators & devices |
| Day 02 | [Modern JavaScript & Strict TypeScript](../days/day-02-javascript-typescript/README.md) | Generics, discriminated unions, `noUncheckedIndexedAccess`, async/await |
| Day 03 | [React 19 Fundamentals for Mobile](../days/day-03-react-fundamentals/README.md) | Functional components, props, composition, lists, keys, conditional rendering |
| Day 04 | [React Hooks in Depth](../days/day-04-react-hooks/README.md) | `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, custom hooks |
| Day 05 | [Styling, Flexbox & Responsive Layout](../days/day-05-styling-and-layout/README.md) | `StyleSheet.create`, Flexbox defaults, `SafeAreaView`, `useWindowDimensions`, dark mode |
| Day 06 | [Core React Native Components](../days/day-06-core-components/README.md) | `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `Modal`, `expo-image` |
| Day 07 | [Building Your First Mobile App](../days/day-07-first-mobile-app/README.md) | End-to-end interactive profile & portfolio app combining Week 1 skills |

**Week 1 Capstone Project:** [Project 01 — Interactive Profile App](../projects/project-01-profile-app/README.md)

---

## Week 2: Navigation, Data & Device Capabilities (Days 08–14)

**Weekly Milestone:** Build multi-screen apps with Expo Router, validate real forms, manage client and server state, authenticate securely, and integrate native device hardware.

| Day | Topic | Core Focus |
| --- | --- | --- |
| Day 08 | [Navigation with Expo Router](../days/day-08-navigation-expo-router/README.md) | File-based routing, Stacks, Tabs, Modals, dynamic `[id]` params, typed routes |
| Day 09 | [Forms & Schema Validation](../days/day-09-forms-and-validation/README.md) | `react-hook-form`, `zod` v4 schemas, keyboard handling, accessible error states |
| Day 10 | [State Management](../days/day-10-state-management/README.md) | Local state vs Context vs Zustand 5, selectors, persisted stores |
| Day 11 | [API Integration & Server State](../days/day-11-api-integration/README.md) | `fetch`, `axios`, TanStack Query v5 (`useQuery`, `useMutation`), caching & retries |
| Day 12 | [Authentication Flows](../days/day-12-authentication/README.md) | Auth context, token refresh, protected routes in Expo Router, `expo-secure-store` |
| Day 13 | [Native Device Features](../days/day-13-device-features/README.md) | Permissions, `expo-camera`, `expo-image-picker`, `expo-location`, `expo-haptics`, sharing |
| Day 14 | [Weather App Workshop](../days/day-14-weather-app/README.md) | Geolocation + weather API + TanStack Query + city search + unit switching |

**Week 2 Capstone Projects:**
- [Project 02 — Weather App](../projects/project-02-weather-app/README.md)
- [Project 04 — Authentication App](../projects/project-04-authentication-app/README.md)

---

## Week 3: Performance, Offline Architecture & Testing (Days 15–21)

**Weekly Milestone:** Engineer smooth 60–120 FPS interfaces, handle large datasets cleanly, support offline-first workflows, organize scalable codebases, and write reliable automated tests.

| Day | Topic | Core Focus |
| --- | --- | --- |
| Day 15 | [Animations & Gestures](../days/day-15-animations/README.md) | Built-in `Animated`, Reanimated worklets, shared values, `react-native-gesture-handler` |
| Day 16 | [Lists & Runtime Performance](../days/day-16-lists-and-performance/README.md) | `FlatList` & `SectionList` tuning, memoization, profiling frame drops, avoiding re-renders |
| Day 17 | [Local Storage & Offline-First Patterns](../days/day-17-local-storage-and-offline/README.md) | AsyncStorage, SecureStore, `expo-sqlite`, optimistic updates, sync queues |
| Day 18 | [App Architecture & Folder Structure](../days/day-18-architecture-and-folder-structure/README.md) | Feature-based architecture, clean service boundaries, dependency inversion, config |
| Day 19 | [Native Modules & Platform Differences](../days/day-19-native-modules-and-platform-differences/README.md) | `Platform.select`, `.ios.tsx`/`.android.tsx`, Expo Config Plugins, CNG/Prebuild, TurboModules |
| Day 20 | [Automated Testing](../days/day-20-testing/README.md) | Jest, `jest-expo`, React Native Testing Library, mocking navigation & network calls |
| Day 21 | [Task Manager Workshop](../days/day-21-task-manager/README.md) | Offline-ready task manager with filtering, SQLite/AsyncStorage persistence & tests |

**Week 3 Capstone Project:** [Project 03 — Task Manager](../projects/project-03-task-manager/README.md)

---

## Week 4: Production Engineering & Career (Days 22–30)

**Weekly Milestone:** Harden your mobile app for real users with WCAG accessibility, mobile security, push notifications, real-time sync, automated EAS CI/CD, and store submission readiness.

| Day | Topic | Core Focus |
| --- | --- | --- |
| Day 22 | [Accessibility (a11y)](../days/day-22-accessibility/README.md) | VoiceOver & TalkBack, `accessibilityRole`, `accessibilityState`, Dynamic Type, contrast |
| Day 23 | [Mobile App Security](../days/day-23-security/README.md) | Secure storage, avoiding hardcoded secrets, input sanitization, TLS & token hygiene |
| Day 24 | [Debugging & DevTools](../days/day-24-debugging-and-devtools/README.md) | React Native DevTools, Hermes profiling, network inspection, error boundaries |
| Day 25 | [Notifications & Background Tasks](../days/day-25-notifications-and-background-tasks/README.md) | `expo-notifications`, local & push notifications, permission UX, notification channels |
| Day 26 | [Backend Integration & Realtime](../days/day-26-backend-and-realtime/README.md) | WebSockets, reconnect strategies, presence indicators, optimistic realtime updates |
| Day 27 | [CI/CD & Deployment with EAS](../days/day-27-cicd-and-deployment/README.md) | EAS Build, EAS Submit, EAS Update (OTA), GitHub Actions pipelines, build profiles |
| Day 28 | [Production Readiness](../days/day-28-production-readiness/README.md) | Crash reporting, analytics, feature flags, splash screens, store metadata, checklists |
| Day 29 | [Production Mobile App Capstone](../days/day-29-production-mobile-app/README.md) | Full end-to-end production architecture tying together auth, offline, realtime & tests |
| Day 30 | [Career, Portfolio & Open Source](../days/day-30-career-and-open-source/README.md) | Interview prep, portfolio polish, contributing to React Native/Expo open source |

**Week 4 Capstone Project:** [Project 05 — Production Mobile App](../projects/project-05-production-mobile-app/README.md)

---

## Featured Projects Summary

| # | Project | Recommended After | Key Skills Demonstrated |
| --- | --- | --- | --- |
| 01 | [Interactive Profile App](../projects/project-01-profile-app/README.md) | Day 07 | Core UI, Flexbox, dark mode, safe areas, interactive state |
| 02 | [Weather App](../projects/project-02-weather-app/README.md) | Day 14 | Location permissions, TanStack Query, API error/loading states |
| 03 | [Task Manager](../projects/project-03-task-manager/README.md) | Day 21 | Local persistence, CRUD workflows, filtering, automated tests |
| 04 | [Authentication App](../projects/project-04-authentication-app/README.md) | Day 12 (revisit on Day 23) | Protected Expo Router groups, SecureStore tokens, Zod validation |
| 05 | [Production Mobile App](../projects/project-05-production-mobile-app/README.md) | Day 29 | Clean architecture, offline sync, accessibility, security, CI/CD |

---

## Where to Go Next

- Choose a customized study pace in the [Learning Path Guide](./LEARNING_PATH.md).
- Configure your machine with the [Environment Setup Guide](./SETUP.md).
- Start directly at [Day 01: Introduction to React Native & Expo](../days/day-01-introduction/README.md).
