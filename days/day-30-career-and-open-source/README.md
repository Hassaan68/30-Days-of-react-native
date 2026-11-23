# Day 30: Career, Open Source and Next Steps

## Learning Objectives

By the end of Day 30, you will be able to:

- Map your progression along the React Native engineering career ladder (Junior → Mid → Senior → Staff).
- Present a standout mobile engineering portfolio with live builds, architecture narratives, and automated tests.
- Scaffold, version, and publish an open-source Expo/React Native library using `create-expo-module`.
- Contribute effectively to React Native, Expo, and open-source repositories using GitHub best practices.
- Answer high-signal technical and mobile system design interview questions covering the New Architecture, performance, offline sync, native modules, and testing.
- Evaluate your capstone app using a structured Final Project Review Rubric.

## Prerequisites

- [Day 28: Production Readiness](../day-28-production-readiness/README.md)
- [Day 29: Build a Complete Production-Style App](../day-29-production-mobile-app/README.md)
- [Project 05: Production Mobile App (PulseTrack)](../../projects/project-05-production-mobile-app/README.md)

## Introduction

Congratulations on reaching Day 30! Over the past month you went from core React fundamentals and styling all the way to offline persistence, native platform differences, security, EAS CI/CD, and building a complete production-style mobile app.

Technical skill alone is only part of landing your next role, winning freelance clients, or growing into a Senior/Staff engineer. Today focuses on turning everything you built into visible career momentum: crafting a portfolio hiring managers actually explore, shipping open-source packages, preparing sharply for React Native interviews, and planning your long-term growth.

## Concepts

### 1. React Native Developer Career Roadmap

| Level | Core Expectations | How to Stand Out |
| --- | --- | --- |
| **Junior** | Build screens cleanly with Flexbox, TypeScript, Expo Router, forms, and REST APIs; write readable PRs | Ship 2–3 complete, bug-free apps with clean READMEs and zero `any` types |
| **Mid-Level** | Own end-to-end features: TanStack Query, Zustand, auth flows, offline caching, 60fps lists, Jest tests, EAS builds | Demonstrate strong debugging, accessibility, and automated CI pipelines |
| **Senior** | Design scalable app architectures, optimize cold starts & memory, write native Swift/Kotlin Expo Modules, mentor peers | Document trade-offs in Architecture Decision Records (ADRs) and lead store launches |
| **Staff** | Shape cross-team mobile strategy, monorepos, shared design systems, observability standards, brownfield migrations | Publish internal/open-source tooling and drive measurable reliability improvements |

### 2. Building a Standout Mobile Portfolio

Hiring managers rarely have time to clone a repo, install CocoaPods, and troubleshoot environment variables. Make your work effortless to evaluate in 60 seconds:

- **Live Preview Links**: Include a QR code or link to an EAS Update preview, TestFlight beta, or signed Android APK right at the top of your README—plus a short 20-second screen recording GIF showing real interactions.
- **Architecture & Trade-offs Section**: Explain *why* you chose TanStack Query for server state and Zustand for UI state, how you handle token refresh, and how your offline queue resolves conflicts.
- **Visible Engineering Rigor**: Include a green GitHub Actions CI badge running `typecheck`, `lint`, and `jest`. Clean commit history and zero dead files immediately separate strong candidates from tutorial copies.
- **Quality Over Quantity**: Two deeply engineered apps (for example, your customized **PulseTrack** capstone plus a real-time or native-feature app) beat ten unfinished starter templates every time.

### 3. Publishing Open-Source React Native & Expo Libraries

Building a focused open-source package is one of the fastest ways to learn native internals and build public credibility:

1. **Scaffold with Expo Modules API**:
   ```bash
   npx create-expo-module@latest expo-my-awesome-library
   ```
   This generates a TypeScript API surface, Swift (iOS) and Kotlin (Android) native bindings compatible with React Native's New Architecture, plus an embedded `example/` app.
2. **Semantic Versioning (`MAJOR.MINOR.PATCH`)**: Never introduce breaking API changes in a `minor` or `patch` release.
3. **Clear Changelog & Migration Guides**: Document every release in `CHANGELOG.md` (using Conventional Commits or Changesets) so adopters can upgrade confidently.
4. **Minimal Peer Dependencies**: List `react`, `react-native`, and `expo` in `peerDependencies` rather than `dependencies` so consumers never hit duplicate runtime copies.

### 4. Contributing to Open Source & GitHub Best Practices

You do not need to rewrite Hermes to make valuable open-source contributions. High-impact starting points include:
- Fixing broken documentation examples or clarifying confusing Expo / React Native error messages.
- Writing minimal reproducible bug reports (with a clean Expo Snack or tiny GitHub repo).
- Tackling `good first issue` tickets in Expo, React Navigation, Zustand, TanStack Query, or right here in [this repository's Contributing Guide](../../CONTRIBUTING.md).

**GitHub PR Best Practices**:
- Keep pull requests small and focused on one clear change.
- Explain **What**, **Why**, and **How Tested** in the PR description (attach iOS + Android screenshots for UI changes).
- Run `npm run typecheck && npm run lint && npm test` locally before pushing.

### 5. Technical & Mobile System Design Interview Prep

Senior React Native interviews typically probe five recurring areas—practice explaining both the *concept* and a *real bug you solved*:

1. **New Architecture (JSI, Fabric, TurboModules)**:
   - *Question*: How does the New Architecture differ from the legacy asynchronous JSON bridge?
   - *Strong Answer*: JSI (JavaScript Interface) lets JS hold direct C++ HostObject references to native modules for synchronous, zero-serialization calls; TurboModules load lazily on demand (improving cold start); Fabric brings a synchronous C++ shadow tree and React 19 concurrent rendering support.
2. **Performance Optimization**:
   - *Question*: A feed screen drops to 25fps while scrolling on a mid-range Android phone. How do you diagnose and fix it?
   - *Strong Answer*: Profile a release build first (never debug mode), inspect unnecessary re-renders with React DevTools Profiler, verify stable `keyExtractor` and memoized row items, move heavy animations/gestures to the UI thread with Reanimated, size images cleanly with `expo-image`, and trim heavy JS work during scroll.
3. **Offline Sync & State Consistency**:
   - *Question*: How would you design an offline-first task/habit app?
   - *Strong Answer*: Persist local source of truth in `expo-sqlite` or AsyncStorage, render optimistic mutations immediately with a client-generated UUID and idempotency key, queue failed writes in an outbox, replay with exponential backoff on reconnect, and resolve conflicts deterministically using `updatedAt` timestamps or server version numbers.
4. **Native Modules & Platform Differences**:
   - *Question*: When do you write a custom native module vs staying in JavaScript, and how does `eas update` interact with native changes?
   - *Strong Answer*: Drop to Swift/Kotlin (via Expo Modules API) for platform SDKs, background hardware APIs, or CPU-heavy processing; remember native code changes alter the `fingerprint` runtime version and require a new `eas build`, never an OTA update.
5. **Testing Strategy**:
   - *Question*: How do you balance unit, integration, and end-to-end tests in React Native?
   - *Strong Answer*: Keep business rules in pure TypeScript modules with fast Jest unit tests, test screen behavior from the user's perspective via `@testing-library/react-native` (querying by accessible roles/labels rather than implementation details), and run Maestro or Detox E2E smoke tests on critical flows (sign-in, checkout, core action).

### 6. Final Capstone Project Review Rubric

Score your finished **PulseTrack** (or custom portfolio app) honestly from `0` to `5` on each criterion before listing it on your resume:

| Category | Weight | What a 5/5 Looks Like |
| --- | --- | --- |
| **Architecture & TypeScript** | 3× | Strict TS (`noUncheckedIndexedAccess`, zero `any`), clean layer boundaries, pure domain logic |
| **UI, UX & Accessibility** | 3× | Safe area handling, responsive spacing, empty/loading/error states, VoiceOver/TalkBack roles & labels |
| **Reliability & Testing** | 3× | Error Boundary, offline/error handling, passing Jest unit/component tests wired into GitHub Actions |
| **Shipping & DevOps** | 2× | Dynamic `app.config.ts`, `eas.json` profiles, live TestFlight/APK/EAS preview link |
| **Documentation** | 2× | Crisp README with screenshots/GIF, architecture overview, setup instructions, and design trade-offs |

Target **85%+ ("Portfolio Ready")** before sending applications!

## Code Examples

### Example 1: Portfolio Rubric Scorer & Career Roadmap Reference

Full source: [`./examples/portfolioChecklist.ts`](./examples/portfolioChecklist.ts)

Key highlights:
- `CAREER_ROADMAP` summarizes concrete focus areas and portfolio proof points from Junior through Staff.
- `DEFAULT_CAPSTONE_RUBRIC` and `scorePortfolioProject()` compute a weighted readiness score, grade (`Portfolio Ready`, `Strong Foundation`, `Needs Polish`), strengths, and prioritized areas to polish.

## Step-by-Step Explanation

1. **Quantify your portfolio objectively**: In `portfolioChecklist.ts`, weighting Architecture, UI/Accessibility, and Testing higher (`3×`) than documentation (`2×`) reflects how hiring teams actually evaluate mobile engineering submissions.
2. **Surface actionable next steps**: `scorePortfolioProject()` automatically groups scores `>= 4` into `strengths` and scores `<= 2` into `improvements`, turning vague self-critique into a concrete weekend polish checklist.
3. **Prepare deliberately for interviews**: In the Day 30 exercises, you build a priority-weighted interview study planner so your prep time goes directly to high-weight gaps instead of re-studying topics you already know.

## Common Mistakes

- **Applying with unfinished "clone" repos**: A repo with default `create-expo-app` README text and broken screenshots hurts more than it helps. Polish two strong apps instead.
- **Memorizing buzzwords without hands-on depth**: Interviewers quickly spot candidates who repeat "JSI is faster than the bridge" without being able to explain serialization overhead or a real profiling session.
- **Neglecting native mobile fundamentals**: Even in Expo apps, understanding iOS signing/TestFlight, Android `.aab` bundles, permissions, and app lifecycle states sets you apart from web-only developers.
- **Waiting until you feel "100% ready" to contribute or apply**: Real engineering confidence is built by shipping, receiving code reviews, and iterating in public.

## Best Practices

- **Write short technical case studies**: A 500-word blog post or README section explaining *"How I cut FlatList frame drops and fixed DST streak bugs in PulseTrack"* is gold during interviews.
- **Keep a "brag document"**: Record every bug fixed, performance metric improved, and app shipped—this makes resume updates and performance reviews effortless.
- **Stay close to official changelogs**: Read every Expo SDK and React Native release post to stay ahead of deprecations and New Architecture improvements.
- **Give back to the community**: Answer a question on GitHub Discussions/Discord, improve a doc page, or contribute an exercise improvement back to this repository.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete [`./exercises/InterviewPrepExercise.ts`](./exercises/InterviewPrepExercise.ts):

- **Beginner**: Implement `filterQuestionsByTopic()` to query a typed interview question bank by topic and optional difficulty ceiling.
- **Intermediate**: Implement `calculateInterviewReadiness()` to compute average mastery, detect weak topics (`< 75%`), and flag critical gaps (`< 60%`).
- **Challenge**: Implement `buildStudyPlan()` to rank interview topics by `(100 - clampedMastery) * interviewWeight` and generate a focused weekly session schedule.

## Solutions

Compare your work with [`./solutions/InterviewPrepSolution.ts`](./solutions/InterviewPrepSolution.ts):

- `filterQuestionsByTopic` keeps input arrays immutable using `.filter()`.
- `calculateInterviewReadiness` clamps out-of-range percentages safely to `[0, 100]`, sorts weak topics ascending, and requires both `averageMastery >= 80` and zero topics below `60%`.
- `buildStudyPlan` calculates weighted priority scores, sorts descending, and slices cleanly to `sessionsPerWeek`.

## Mini Project

**Ship Your Public Portfolio Capstone**

Turn your 30-day work into a career-ready showcase:
1. Fork or customize [Project 05: PulseTrack](../../projects/project-05-production-mobile-app/README.md) with at least two unique features of your own.
2. Score it honestly using `scorePortfolioProject()` from `examples/portfolioChecklist.ts` and polish every criterion scoring below `4`.
3. Record a 20-second demo video/GIF, add an architecture diagram to the README, publish a live preview build with EAS, and share your project on GitHub and LinkedIn!

## Key Takeaways

- Career growth in React Native moves from building clean screens (Junior) → owning full features & quality (Mid) → architecting resilient systems & native modules (Senior) → scaling mobile platforms (Staff).
- Two deeply engineered, tested, live-previewable apps beat a dozen half-finished tutorials.
- Publishing a small `create-expo-module` library or contributing clean open-source PRs builds real credibility and native mastery.
- Prepare for interviews by connecting New Architecture, performance, offline sync, native integration, and testing concepts back to real code you shipped.

## Further Reading

- [Expo Modules API (`create-expo-module`)](https://docs.expo.dev/modules/overview/)
- [React Native New Architecture Overview](https://reactnative.dev/architecture/landing-page)
- [Expo Blog & SDK Release Notes](https://expo.dev/blog)
- [React Native Official Blog](https://reactnative.dev/blog)
- [Semantic Versioning Specification](https://semver.org/)

## Progress Checklist

- [ ] Reviewed the Junior → Staff React Native career roadmap
- [ ] Scored your capstone project against the Final Project Review Rubric in `portfolioChecklist.ts`
- [ ] Practiced answering all 5 core React Native technical & system design interview topics
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `InterviewPrepExercise.ts`
- [ ] Planned your first open-source contribution or public portfolio launch

## Course Complete

You did it—**30 Days of React Native is complete!**

From your very first component to real-time WebSockets, EAS CI/CD pipelines, production readiness checklists, and a full capstone app, you now have the engineering foundation to build and ship real mobile software with confidence.

Where to go from here:
- Build, extend, and ship the full capstone app in [Project 05: Production Mobile App (PulseTrack)](../../projects/project-05-production-mobile-app/README.md).
- Give back to future learners by opening a pull request via our [Contributing Guide](../../CONTRIBUTING.md).
- Revisit any day or featured project anytime from the [30 Days of React Native Home Page](../../README.md).
