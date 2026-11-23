# Learning Paths

Not every learner starts from the same place. Use this guide to pick the track that best matches your current background and available time.

If you have not configured your local environment yet, start with the [Environment Setup Guide](./SETUP.md).

---

## Track 1: Absolute Beginner (Full 30-Day Journey)

**Best for:** Developers who are new to React, TypeScript, or mobile development and want steady, structured progress.

**Recommended pace:** 60–90 minutes per day, 5–6 days per week (5–6 weeks total).

### Suggested Sequence

1. **Foundation Sprint (Days 01–07):** Complete every lesson, exercise, and mini project in order:
   - [Day 01: Introduction](../days/day-01-introduction/README.md) → [Day 02: JavaScript & TypeScript](../days/day-02-javascript-typescript/README.md) → [Day 03: React Fundamentals](../days/day-03-react-fundamentals/README.md) → [Day 04: React Hooks](../days/day-04-react-hooks/README.md) → [Day 05: Styling & Layout](../days/day-05-styling-and-layout/README.md) → [Day 06: Core Components](../days/day-06-core-components/README.md) → [Day 07: First Mobile App](../days/day-07-first-mobile-app/README.md)
   - **Checkpoint Project:** Build [Project 01 — Profile App](../projects/project-01-profile-app/README.md) from scratch before moving on.
2. **App Mechanics Sprint (Days 08–14):** Learn navigation, forms, state, APIs, auth, and device features:
   - [Day 08](../days/day-08-navigation-expo-router/README.md) through [Day 14](../days/day-14-weather-app/README.md)
   - **Checkpoint Projects:** Complete [Project 02 — Weather App](../projects/project-02-weather-app/README.md) and [Project 04 — Authentication App](../projects/project-04-authentication-app/README.md).
3. **Engineering Depth Sprint (Days 15–21):** Focus on smooth UI, offline storage, clean architecture, and testing:
   - [Day 15](../days/day-15-animations/README.md) through [Day 21](../days/day-21-task-manager/README.md)
   - **Checkpoint Project:** Build [Project 03 — Task Manager](../projects/project-03-task-manager/README.md).
4. **Production Sprint (Days 22–30):** Master accessibility, security, notifications, realtime, and EAS deployment:
   - [Day 22](../days/day-22-accessibility/README.md) through [Day 30](../days/day-30-career-and-open-source/README.md)
   - **Final Capstone:** Complete [Project 05 — Production Mobile App](../projects/project-05-production-mobile-app/README.md).

**Study Tip:** Do not skip the `exercises/` folder. Attempting the starter file for 15–20 minutes before opening `solutions/` builds far stronger retention than reading solutions passively.

---

## Track 2: React Web Developer Transition (3 Weeks)

**Best for:** Engineers already comfortable with React 19, hooks, and TypeScript on the web who want to translate those skills to iOS and Android quickly.

**Recommended pace:** 1.5–2 hours per day across 20–21 days.

### What You Can Skim vs. Study Deeply

- **Skim / Review Quickly (1–2 days total):**
  - [Day 02: JavaScript & TypeScript](../days/day-02-javascript-typescript/README.md) (focus on `noUncheckedIndexedAccess` and RN 0.88 strict types)
  - [Day 03: React Fundamentals](../days/day-03-react-fundamentals/README.md) and [Day 04: React Hooks](../days/day-04-react-hooks/README.md)
- **Study Deeply — Mobile-Specific Paradigms:**
  - [Day 01: Introduction](../days/day-01-introduction/README.md) — New Architecture (Fabric, JSI, Hermes) and Expo SDK 58
  - [Day 05: Styling & Layout](../days/day-05-styling-and-layout/README.md) — No CSS cascade, `flexDirection: 'column'` default, `SafeAreaView`
  - [Day 06: Core Components](../days/day-06-core-components/README.md) — `View`/`Text` rules, `Pressable`, `FlatList`
  - [Day 08: Navigation with Expo Router](../days/day-08-navigation-expo-router/README.md) — Native stacks, tab bars, modals, deep linking
  - [Day 13: Device Features](../days/day-13-device-features/README.md) — Runtime permissions, camera, location, haptics
  - [Day 15: Animations](../days/day-15-animations/README.md) — UI-thread worklets vs JS thread
  - [Day 16: Lists & Performance](../days/day-16-lists-and-performance/README.md) — Virtualization and mobile frame budgets
  - [Day 17: Local Storage & Offline](../days/day-17-local-storage-and-offline/README.md) — SecureStore, SQLite, offline sync
  - [Day 19: Native Modules & Platform Differences](../days/day-19-native-modules-and-platform-differences/README.md) — CNG, Config Plugins, iOS vs Android behavior
  - [Day 22: Accessibility](../days/day-22-accessibility/README.md) through [Day 28: Production Readiness](../days/day-28-production-readiness/README.md)
- **Recommended Projects:** [Project 02 — Weather App](../projects/project-02-weather-app/README.md), [Project 04 — Authentication App](../projects/project-04-authentication-app/README.md), and [Project 05 — Production Mobile App](../projects/project-05-production-mobile-app/README.md).

---

## Track 3: Fast-Track 14-Day Intensive

**Best for:** Experienced software engineers preparing for a mobile project kickoff or technical interview on a tight timeline.

**Recommended pace:** 2.5–3 hours per day for 14 days.

| Intensive Day | Lessons to Complete | Goal |
| --- | --- | --- |
| 1 | [Day 01](../days/day-01-introduction/README.md), [Day 05](../days/day-05-styling-and-layout/README.md) | Environment running + Flexbox & Safe Area layout mastery |
| 2 | [Day 06](../days/day-06-core-components/README.md), [Day 07](../days/day-07-first-mobile-app/README.md) | Core native primitives + first working screen |
| 3 | [Day 08](../days/day-08-navigation-expo-router/README.md) | Stacks, tabs, modals, and typed routes in Expo Router |
| 4 | [Day 09](../days/day-09-forms-and-validation/README.md), [Day 10](../days/day-10-state-management/README.md) | Forms with React Hook Form + Zod and Zustand global state |
| 5 | [Day 11](../days/day-11-api-integration/README.md), [Day 12](../days/day-12-authentication/README.md) | TanStack Query server state + SecureStore auth flow |
| 6 | [Day 13](../days/day-13-device-features/README.md), [Day 14](../days/day-14-weather-app/README.md) | Device permissions + [Project 02 — Weather App](../projects/project-02-weather-app/README.md) |
| 7 | [Day 15](../days/day-15-animations/README.md), [Day 16](../days/day-16-lists-and-performance/README.md) | Reanimated worklets + FlatList performance tuning |
| 8 | [Day 17](../days/day-17-local-storage-and-offline/README.md), [Day 18](../days/day-18-architecture-and-folder-structure/README.md) | Offline storage + feature-sliced architecture |
| 9 | [Day 19](../days/day-19-native-modules-and-platform-differences/README.md), [Day 20](../days/day-20-testing/README.md) | Platform branching + Jest & RNTL tests |
| 10 | [Day 21](../days/day-21-task-manager/README.md) | Build [Project 03 — Task Manager](../projects/project-03-task-manager/README.md) |
| 11 | [Day 22](../days/day-22-accessibility/README.md), [Day 23](../days/day-23-security/README.md) | Accessibility auditing + mobile security hardening |
| 12 | [Day 24](../days/day-24-debugging-and-devtools/README.md), [Day 25](../days/day-25-notifications-and-background-tasks/README.md) | Profiling with DevTools + push notifications |
| 13 | [Day 26](../days/day-26-backend-and-realtime/README.md), [Day 27](../days/day-27-cicd-and-deployment/README.md) | Realtime WebSockets + EAS CI/CD pipelines |
| 14 | [Day 28](../days/day-28-production-readiness/README.md), [Day 29](../days/day-29-production-mobile-app/README.md) | Production checklist + [Project 05 — Production Mobile App](../projects/project-05-production-mobile-app/README.md) |

---

## Track 4: Production Engineer Track (Hardening & Scale)

**Best for:** Developers who can already build Expo screens and basic navigation, and now want to level up to senior mobile engineering practices.

**Focus Lessons:**
- **Architecture & Native Bridge:** [Day 18: Architecture & Folder Structure](../days/day-18-architecture-and-folder-structure/README.md), [Day 19: Native Modules & Platform Differences](../days/day-19-native-modules-and-platform-differences/README.md)
- **Performance & Offline Resilience:** [Day 15: Animations](../days/day-15-animations/README.md), [Day 16: Lists & Performance](../days/day-16-lists-and-performance/README.md), [Day 17: Local Storage & Offline](../days/day-17-local-storage-and-offline/README.md)
- **Quality & Safety:** [Day 20: Testing](../days/day-20-testing/README.md), [Day 22: Accessibility](../days/day-22-accessibility/README.md), [Day 23: Security](../days/day-23-security/README.md), [Day 24: Debugging & DevTools](../days/day-24-debugging-and-devtools/README.md)
- **Delivery & Operations:** [Day 25: Notifications & Background Tasks](../days/day-25-notifications-and-background-tasks/README.md), [Day 26: Backend & Realtime](../days/day-26-backend-and-realtime/README.md), [Day 27: CI/CD & Deployment](../days/day-27-cicd-and-deployment/README.md), [Day 28: Production Readiness](../days/day-28-production-readiness/README.md)
- **Capstone:** [Day 29: Production Mobile App](../days/day-29-production-mobile-app/README.md) & [Project 05 — Production Mobile App](../projects/project-05-production-mobile-app/README.md)

---

## Tracking Your Progress

Run the built-in progress tracker from the repository root at any time:

```bash
npm run progress
```

You can also check off the `## Progress Checklist` inside each daily `README.md` as you finish lessons and exercises.

---

## Related Guides

- [Full Curriculum Roadmap](./ROADMAP.md)
- [Environment Setup Guide](./SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Frequently Asked Questions](./FAQ.md)
