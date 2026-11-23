<p align="center">
  <img src="./assets/images/banner.svg" alt="30 Days of React Native Banner" width="100%" />
</p>

<h1 align="center">30 Days of React Native</h1>

<p align="center">
  <strong>A structured, 30-day open-source curriculum to master modern mobile development with React Native, Expo, and TypeScript — from your first screen to production app store releases.</strong>
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=white" alt="React Native 0.88" />
  <img src="https://img.shields.io/badge/Expo%20SDK-58-000020?logo=expo&logoColor=white" alt="Expo SDK 58" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.8" />
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

Inspired by [`asabeneh/30-days-of-python`](https://github.com/asabeneh/30-days-of-python), **30 Days of React Native** is a hands-on, step-by-step learning repository designed to take you from zero mobile experience to building, testing, and deploying production-ready iOS and Android apps with **React Native 0.88**, **Expo SDK 58**, **Expo Router**, and **strict TypeScript**.

Every single day includes a complete tutorial, runnable TypeScript code examples, beginner-to-challenge exercises, full solutions, and a mini project.

---

## Table of Contents

- [Who This Project Is For](#who-this-project-is-for)
- [Why Use 30 Days of React Native?](#why-use-30-days-of-react-native)
- [Verified Technology Stack](#verified-technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [How to Run Examples and Validation](#how-to-run-examples-and-validation)
- [30-Day Learning Roadmap](#30-day-learning-roadmap)
- [Learning Progress Tracker](#learning-progress-tracker)
- [Daily Progress Checklist](#daily-progress-checklist)
- [Beginner-to-Advanced Learning Paths](#beginner-to-advanced-learning-paths)
- [Featured Projects](#featured-projects)
- [Technologies Covered](#technologies-covered)
- [Repository Documentation](#repository-documentation)
- [Official Documentation Links](#official-documentation-links)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Contributing](#contributing)
- [Community Resources](#community-resources)
- [Support This Repository](#support-this-repository)
- [License](#license)

---

## Who This Project Is For

- **JavaScript and TypeScript developers** who want to build native iOS and Android mobile apps without starting from scratch in Swift and Kotlin.
- **React web developers** transitioning to React Native, Expo Router, mobile gestures, native APIs, and app store deployment.
- **Self-taught learners and students** looking for a clear, structured daily routine with real exercises, solutions, and portfolio-grade projects.
- **Professional engineers** wanting an up-to-date reference for React Native's New Architecture, Expo SDK 58, TanStack Query, Zustand, Reanimated, testing, accessibility, and EAS CI/CD.

---

## Why Use 30 Days of React Native?

- **Modern from Day 1:** Built around the official React Native recommendation — **Expo**, **Expo Router**, **TypeScript**, and the **New Architecture**. Zero deprecated APIs (`SafeAreaView` from `react-native`, legacy bridge hacks, or outdated navigation patterns are avoided and explicitly explained).
- **Learn by building:** Every day ends with three progressive exercises (Beginner, Intermediate, Challenge) plus a mini project, culminating in **5 featured mobile applications**.
- **Production practices included:** Goes far beyond "Hello World" to cover secure storage, offline SQLite sync, accessibility (VoiceOver & TalkBack), unit/component testing with Jest & React Native Testing Library, performance profiling, and App Store / Google Play deployment via EAS.
- **Verified code quality:** Repository examples, exercises, and solutions are written in strict TypeScript and validated with automated curriculum, link, type, lint, and Jest test checks.

---

## Verified Technology Stack

All versions and official recommendations in this repository were verified against official documentation on **November 23, 2026**:

| Technology | Version | Notes |
| --- | --- | --- |
| **Expo SDK** | `~58.0.0` | Latest stable SDK (released October 15, 2026) |
| **React Native** | `0.88.0` | New Architecture & Strict TypeScript API enabled by default |
| **React** | `19.3.0` | Compatible React release bundled with RN 0.88 |
| **Expo Router** | `~58.0.0` | Unified SDK versioning; file-based routing, native tabs & loaders |
| **TypeScript** | `~5.8.3` | Strict mode + `noUncheckedIndexedAccess` |
| **Node.js** | `22.13+` / `24.3+` (LTS) | Required by Expo SDK 58 tooling (`.nvmrc` targets Node `24`) |
| **Testing** | `jest-expo ~58.0.0` + `@testing-library/react-native` | Official Expo testing setup |
| **Linting** | ESLint v9 Flat Config + Prettier | Modern `eslint.config.js` format |

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full list of deprecated APIs avoided and modern replacements used throughout this curriculum.

---

## Prerequisites

Before starting Day 01, you should have:

- Basic familiarity with programming fundamentals (variables, functions, loops, conditionals).
- Comfort using a terminal / command line and Git.
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/).
- **Node.js 22.13+ or 24.3+ (LTS)** installed (see [docs/SETUP.md](./docs/SETUP.md) for macOS, Windows, and Linux setup).
- An iOS or Android phone with the **Expo Go** app installed, or Xcode (macOS) / Android Studio for simulators and emulators.

> **New to TypeScript or React?** No problem — [Day 02](./days/day-02-javascript-typescript/README.md), [Day 03](./days/day-03-react-fundamentals/README.md), and [Day 04](./days/day-04-react-hooks/README.md) teach all the JavaScript, TypeScript, and React fundamentals you need for mobile development.

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/30-days-of-react-native.git
cd 30-days-of-react-native
```

### Install Dependencies

Make sure you are using Node.js 22.13+ or 24.3+ (if you use `nvm`, run `nvm use`):

```bash
npm install
```

### How to Run Examples and Validation

This repository is structured as a **learning workspace**. To run any daily example or featured project on a real phone or simulator, create a fresh practice Expo app alongside your learning or copy a screen into an Expo Router route:

```bash
# Create your personal playground app with the latest Expo template
npx create-expo-app@latest rn-playground
cd rn-playground
npx expo start
```

Inside this repository, you can also run built-in developer and validation scripts:

```bash
# Check your daily progress from the checklist below
npm run progress

# Run TypeScript type checking across all examples, exercises, solutions, and projects
npm run typecheck

# Run ESLint across the repository
npm run lint

# Run automated Jest & React Native Testing Library tests
npm test

# Verify all 30 daily folders, required sections, and internal Markdown links
npm run validate:curriculum
npm run validate:links

# Run all checks together
npm run validate:all
```

For complete OS-specific setup (macOS, Windows, Linux, iOS Simulator, Android Emulator, and Expo Go vs Development Builds), read [docs/SETUP.md](./docs/SETUP.md).

---

## 30-Day Learning Roadmap

Click any day to open its full tutorial, code examples, exercises, and solutions.

### Week 1: Foundations

| Day | Topic | Level | Status |
| --- | --- | --- | --- |
| [01](./days/day-01-introduction/README.md) | Introduction to React Native and Expo | Beginner | Not started |
| [02](./days/day-02-javascript-typescript/README.md) | JavaScript and TypeScript for React Native | Beginner | Not started |
| [03](./days/day-03-react-fundamentals/README.md) | React Fundamentals | Beginner | Not started |
| [04](./days/day-04-react-hooks/README.md) | React Hooks | Beginner | Not started |
| [05](./days/day-05-styling-and-layout/README.md) | Styling and Layout | Beginner | Not started |
| [06](./days/day-06-core-components/README.md) | Core React Native Components | Beginner | Not started |
| [07](./days/day-07-first-mobile-app/README.md) | Build Your First Mobile App (Profile App) | Beginner | Not started |

### Week 2: Real Mobile Development

| Day | Topic | Level | Status |
| --- | --- | --- | --- |
| [08](./days/day-08-navigation-expo-router/README.md) | Navigation with Expo Router | Intermediate | Not started |
| [09](./days/day-09-forms-and-validation/README.md) | Forms and Validation (React Hook Form + Zod) | Intermediate | Not started |
| [10](./days/day-10-state-management/README.md) | State Management (Context API + Zustand) | Intermediate | Not started |
| [11](./days/day-11-api-integration/README.md) | API Integration (Fetch, Axios & TanStack Query) | Intermediate | Not started |
| [12](./days/day-12-authentication/README.md) | Authentication & Protected Routes | Intermediate | Not started |
| [13](./days/day-13-device-features/README.md) | Device Features (Camera, Location, Haptics & More) | Intermediate | Not started |
| [14](./days/day-14-weather-app/README.md) | Build a Weather App | Intermediate | Not started |

### Week 3: Advanced React Native

| Day | Topic | Level | Status |
| --- | --- | --- | --- |
| [15](./days/day-15-animations/README.md) | Animations (Animated API, Reanimated & Gestures) | Advanced | Not started |
| [16](./days/day-16-lists-and-performance/README.md) | Lists and Performance Optimization | Advanced | Not started |
| [17](./days/day-17-local-storage-and-offline/README.md) | Local Storage and Offline Apps (SQLite & Sync) | Advanced | Not started |
| [18](./days/day-18-architecture-and-folder-structure/README.md) | Architecture and Folder Structure | Advanced | Not started |
| [19](./days/day-19-native-modules-and-platform-differences/README.md) | Native Modules and Platform Differences | Advanced | Not started |
| [20](./days/day-20-testing/README.md) | Testing (Jest & React Native Testing Library) | Advanced | Not started |
| [21](./days/day-21-task-manager/README.md) | Build a Task Manager | Advanced | Not started |

### Week 4: Production and Professional Development

| Day | Topic | Level | Status |
| --- | --- | --- | --- |
| [22](./days/day-22-accessibility/README.md) | Accessibility (VoiceOver, TalkBack & Inclusive UI) | Professional | Not started |
| [23](./days/day-23-security/README.md) | Mobile Security Best Practices | Professional | Not started |
| [24](./days/day-24-debugging-and-devtools/README.md) | Debugging and Developer Tools | Professional | Not started |
| [25](./days/day-25-notifications-and-background-tasks/README.md) | Notifications and Background Tasks | Professional | Not started |
| [26](./days/day-26-backend-and-realtime/README.md) | Backend Integration and Real-Time Features | Professional | Not started |
| [27](./days/day-27-cicd-and-deployment/README.md) | CI/CD and App Deployment (EAS Build & Update) | Professional | Not started |
| [28](./days/day-28-production-readiness/README.md) | Production Readiness & Store Checklists | Professional | Not started |
| [29](./days/day-29-production-mobile-app/README.md) | Build a Complete Production-Style App | Professional | Not started |
| [30](./days/day-30-career-and-open-source/README.md) | Career, Open Source and Next Steps | Professional | Not started |

---

## Learning Progress Tracker

Track your milestone progress across the four weeks. Update your fork as you finish each week, or run `npm run progress` in your terminal to render a progress bar from your checklist!

| Week | Focus Area | Capstone Milestone | Progress |
| --- | --- | --- | --- |
| **Week 1** | Foundations & Mobile UI | [Project 01: Profile App](./projects/project-01-profile-app/README.md) | `0 / 7 days` |
| **Week 2** | Navigation, Data & Device APIs | [Project 02: Weather App](./projects/project-02-weather-app/README.md) | `0 / 7 days` |
| **Week 3** | Performance, Architecture & Testing | [Project 03: Task Manager](./projects/project-03-task-manager/README.md) | `0 / 7 days` |
| **Week 4** | Production, Security & Deployment | [Project 05: Production App](./projects/project-05-production-mobile-app/README.md) | `0 / 9 days` |

---

## Daily Progress Checklist

Fork this repository and check off each day as you complete its tutorial, exercises, and mini project. Run `npm run progress` anytime to check your completion percentage.

<details>
<summary><strong>Click to expand your 30-Day Progress Checklist</strong></summary>

- [ ] Day 01: Introduction to React Native and Expo
- [ ] Day 02: JavaScript and TypeScript for React Native
- [ ] Day 03: React Fundamentals
- [ ] Day 04: React Hooks
- [ ] Day 05: Styling and Layout
- [ ] Day 06: Core React Native Components
- [ ] Day 07: Build Your First Mobile App
- [ ] Day 08: Navigation with Expo Router
- [ ] Day 09: Forms and Validation
- [ ] Day 10: State Management
- [ ] Day 11: API Integration
- [ ] Day 12: Authentication
- [ ] Day 13: Device Features
- [ ] Day 14: Build a Weather App
- [ ] Day 15: Animations
- [ ] Day 16: Lists and Performance
- [ ] Day 17: Local Storage and Offline Apps
- [ ] Day 18: Architecture and Folder Structure
- [ ] Day 19: Native Modules and Platform Differences
- [ ] Day 20: Testing
- [ ] Day 21: Build a Task Manager
- [ ] Day 22: Accessibility
- [ ] Day 23: Security
- [ ] Day 24: Debugging and Developer Tools
- [ ] Day 25: Notifications and Background Tasks
- [ ] Day 26: Backend Integration and Real-Time Features
- [ ] Day 27: CI/CD and App Deployment
- [ ] Day 28: Production Readiness
- [ ] Day 29: Build a Complete Production-Style App
- [ ] Day 30: Career, Open Source and Next Steps

</details>

---

## Beginner-to-Advanced Learning Paths

Not everyone starts from the same baseline. Choose the path that fits your background (full details in [docs/LEARNING_PATH.md](./docs/LEARNING_PATH.md)):

| Track | Best For | Recommended Route |
| --- | --- | --- |
| **Complete Beginner** | New to React and mobile development | Follow **Days 01 → 30** sequentially (~1.5–2 hours/day) |
| **React Web Developer** | Comfortable with React & TypeScript on the web | Skim Days 02–04, focus on **Days 01, 05–29** |
| **14-Day Fast Track** | Engineers needing to ship an Expo MVP quickly | Days 01, 05–14, 17–18, 20, 23, 27–29 |
| **Production Readiness** | Intermediate RN devs leveling up to Senior | Days 15–30 + [Project 05](./projects/project-05-production-mobile-app/README.md) |

---

## Featured Projects

Apply what you learn by building five portfolio-ready applications in [`projects/`](./projects):

| # | Project | Focus Areas | Guide |
| --- | --- | --- | --- |
| 01 | **Profile App** | Flexbox, themes, reusable components, safe areas | [View Project 01](./projects/project-01-profile-app/README.md) |
| 02 | **Weather App** | Open-Meteo API, city search, geolocation, pull-to-refresh | [View Project 02](./projects/project-02-weather-app/README.md) |
| 03 | **Task Manager** | Zustand, AsyncStorage persistence, CRUD, filtering, Jest tests | [View Project 03](./projects/project-03-task-manager/README.md) |
| 04 | **Authentication App** | SecureStore, React Hook Form + Zod, protected routes, sessions | [View Project 04](./projects/project-04-authentication-app/README.md) |
| 05 | **PulseTrack (Production App)** | Full feature-based architecture, offline storage, a11y, error boundaries & tests | [View Project 05](./projects/project-05-production-mobile-app/README.md) |

---

## Technologies Covered

- **Core:** React Native 0.88, Expo SDK 58, React 19.3, TypeScript 5.8
- **Navigation:** Expo Router (Stack, Tabs, Nested Layouts, Dynamic Routes, Deep Linking)
- **Forms & Validation:** React Hook Form, Zod v4, `@hookform/resolvers`
- **State & Data:** Context API, Zustand v5, Fetch, Axios, TanStack Query v5, WebSockets
- **UI, Motion & Media:** StyleSheet, Flexbox, `react-native-safe-area-context`, Reanimated, Gesture Handler, `expo-image`
- **Storage & Device APIs:** AsyncStorage, `expo-secure-store`, `expo-sqlite`, `expo-camera`, `expo-image-picker`, `expo-location`, `expo-notifications`, `expo-haptics`, `expo-clipboard`, `expo-sharing`
- **Quality & Shipping:** Jest, `jest-expo`, React Native Testing Library, ESLint Flat Config, Prettier, EAS Build, EAS Submit, EAS Update, GitHub Actions

---

## Repository Documentation

- [Roadmap & Verified Versions](./docs/ROADMAP.md) — Curriculum breakdown, verified package matrix, and deprecated APIs avoided
- [Learning Paths](./docs/LEARNING_PATH.md) — Tailored schedules for beginners, React web devs, and experienced engineers
- [Environment Setup](./docs/SETUP.md) — macOS, Windows, Linux, iOS Simulator, Android Emulator, and physical devices
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) — Metro errors, clearing caches, SDK upgrades, TypeScript errors, and RN Directory
- [Glossary](./docs/GLOSSARY.md) — Plain-English definitions of React Native & Expo terminology
- [Resources](./docs/RESOURCES.md) — Curated official docs, libraries, tools, and communities
- [FAQ](./docs/FAQ.md) — Answers to common questions

---

## Official Documentation Links

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Expo SDK Changelog](https://expo.dev/changelog)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Native Directory](https://reactnative.directory/)
- [EAS (Expo Application Services)](https://docs.expo.dev/eas/)

---

## Frequently Asked Questions

<details>
<summary><strong>Do I need a Mac to follow this course?</strong></summary>

No! You can follow nearly the entire curriculum on **Windows, macOS, or Linux** using an Android Emulator or a physical iPhone/Android device with Expo Go. When you are ready to build an iOS binary for the App Store, **EAS Build** compiles iOS apps in the cloud without requiring a Mac.
</details>

<details>
<summary><strong>Why does this course use Expo instead of the bare React Native CLI?</strong></summary>

The React Native core team officially recommends starting every new React Native project with a framework like **Expo**. Expo provides file-based routing, first-class TypeScript support, native modules, Continuous Native Generation (CNG), and cloud builds — and you still have full access to native Swift and Kotlin code whenever you need it.
</details>

<details>
<summary><strong>How much time should I spend each day?</strong></summary>

Plan for **60–120 minutes per day**: ~25 minutes reading the concepts and code walkthrough, ~35–60 minutes completing the three exercises, and ~20–35 minutes building the mini project. Go at your own pace — consistency beats speed.
</details>

Read more answers in [docs/FAQ.md](./docs/FAQ.md).

---

## Contributing

Contributions from learners and experienced mobile engineers alike make this resource better for everyone! You can help by:

- Fixing typos or clarifying explanations that felt confusing while learning
- Improving TypeScript examples or adding edge-case tests
- Adding new exercises or mini-project ideas
- Translating tutorials into other languages
- Keeping lessons aligned with future Expo SDK and React Native releases

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md) before opening a pull request.

---

## Community Resources

- [Need Help? Support Guide](./SUPPORT.md)
- [Security Policy](./SECURITY.md)
- [Expo Discord Community](https://chat.expo.dev/)
- [Reactiflux Discord (`#react-native`)](https://www.reactiflux.com/)
- [React Native GitHub Discussions](https://github.com/react-native-community/discussions-and-proposals)

---

## Support This Repository

If **30 Days of React Native** helps you learn mobile development or build your next app:

- **Star this repository** on GitHub so more developers can discover it.
- **Share your daily progress** (`#30DaysOfReactNative`) and showcase the 5 projects you build.
- **Open a pull request** or suggest improvements via GitHub Issues to help future learners.

---

## License

This project is open source and available under the [MIT License](./LICENSE).
