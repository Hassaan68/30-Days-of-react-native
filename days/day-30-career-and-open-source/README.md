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

## Why This Concept Matters

Being able to build a solid React Native app is only half of landing a mobile engineering role or growing into a Senior engineer. Hiring managers and engineering teams can only evaluate what they can see and verify: clear code, working builds, honest architectural explanations, and thoughtful technical communication. Treating your portfolio, open-source contributions, and interview preparation with the same rigor you apply to production code turns 30 days of learning into lasting career momentum.

## Introduction

Congratulations on reaching Day 30! Over the past month you went from core React fundamentals and styling all the way to offline persistence, native platform differences, security, EAS CI/CD, and building a complete production-style mobile app.

Today focuses on practical, realistic next steps: mapping what companies expect at each engineering level, turning your capstone into a portfolio hiring managers can evaluate quickly, making meaningful open-source contributions, and preparing methodically for React Native technical and system design interviews.

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

- **Live Preview Links**: Include a link or QR code to an EAS Update preview, TestFlight beta, or signed Android APK right at the top of your README—plus a short 20-second screen recording GIF showing real interactions.
- **Architecture & Trade-offs Section**: Explain *why* you chose TanStack Query for server state and Zustand for UI state, how you handle token refresh, and how your offline queue resolves conflicts.
- **Visible Engineering Rigor**: Include a green GitHub Actions CI badge running `typecheck`, `lint`, and `jest`. Clean commit history and zero dead files immediately separate strong candidates from tutorial copies.
- **Quality Over Quantity**: Two deeply engineered apps (for example, your customized **PulseTrack** capstone plus a real-time or native-feature app) beat ten unfinished starter templates every time.

### 3. Publishing Open-Source React Native & Expo Libraries

Building a focused open-source package is a practical way to learn native internals and share useful tooling with the community:

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
- Tackling `good first issue` tickets in Expo, React Navigation, Zustand, TanStack Query, or right here via [this repository's Contributing Guide](../../CONTRIBUTING.md).

**GitHub PR Best Practices**:
- Keep pull requests small and focused on one clear change.
- Explain **What**, **Why**, and **How Tested** in the PR description (attach iOS + Android screenshots for UI changes).
- Run `npm run typecheck && npm run lint && npm test` locally before pushing.

### 5. Technical & Mobile System Design Interview Prep

Senior React Native interviews typically probe five recurring areas—practice explaining both the *concept* and a *real bug or trade-off you handled*:

1. **New Architecture (JSI, Fabric, TurboModules) & Hermes**:
   - *Question*: How does the New Architecture differ from the legacy asynchronous JSON bridge, and how does Hermes help startup?
   - *Strong Answer*: JSI (JavaScript Interface) lets JS hold direct C++ HostObject references to native modules for synchronous, zero-serialization calls; TurboModules load lazily on demand (improving cold start); Fabric brings a synchronous C++ shadow tree and React 19 concurrent rendering support. Alongside this, Hermes precompiles JavaScript into compact `.hbc` bytecode at build time and executes it in the Hermes bytecode VM on-device, avoiding runtime JS parsing overhead.
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

> **How to use today's example**: `portfolioChecklist.ts` is a **reusable TypeScript helper & reference module** (not a mobile UI screen). Import it into a small self-review script or Jest test to score your own capstone project objectively. To preview interactive UI screens elsewhere in this repository, run `npm start` from the repo root.

### Example 1: Portfolio Rubric Scorer & Career Roadmap Reference

- **Type**: Reusable helper & reference module
- **Where to place in a project**: `scripts/portfolioChecklist.ts` (or `src/tools/portfolioChecklist.ts`)
- **Full source**: [`./examples/portfolioChecklist.ts`](./examples/portfolioChecklist.ts)

Key highlights:
- `CAREER_ROADMAP` summarizes concrete focus areas and portfolio proof points from Junior through Staff.
- `DEFAULT_CAPSTONE_RUBRIC` and `scorePortfolioProject()` compute a weighted readiness score, grade (`Portfolio Ready`, `Strong Foundation`, `Needs Polish`), strengths, and prioritized areas to polish.

## Step-by-Step Explanation

1. **Quantify your portfolio objectively**: In `portfolioChecklist.ts`, weighting Architecture, UI/Accessibility, and Testing higher (`3×`) than documentation (`2×`) reflects how hiring teams actually evaluate mobile engineering submissions.
2. **Surface actionable next steps**: `scorePortfolioProject()` clamps scores to `[0, 5]`, guards against zero-weight inputs, and automatically groups scores `>= 4` into `strengths` and scores `<= 2` into `improvements`, turning vague self-critique into a concrete polish checklist.
3. **Prepare deliberately for interviews**: In the Day 30 exercises, you build a priority-weighted interview study planner so your prep time goes directly to high-weight gaps instead of re-studying topics you already know.

## Expected Output

Passing `DEFAULT_CAPSTONE_RUBRIC` into `scorePortfolioProject()` returns the following structured self-review summary:

```text
{
  weightedScore: 60,
  maxWeightedScore: 65,
  percentage: 92,
  grade: "Portfolio Ready",
  strengths: [
    "Strict TypeScript, clean folder boundaries, decoupled domain logic",
    "Responsive layout, safe areas, empty/error states, accessibility roles & labels",
    "Automated Jest unit/component tests passing in GitHub Actions CI",
    "Installable preview build (TestFlight / APK / EAS Update link) with env config",
    "README with screenshots/demo GIF, architecture diagram, setup steps, and trade-offs"
  ],
  improvements: []
}
```

If you lower `tests-ci` to `2` and `shipping-eas` to `2`, the grade drops to `"Strong Foundation"` and both items appear directly in `improvements` so you know exactly what to fix next.

## Common Mistakes

- **Applying with unfinished "clone" repos**: A repo with default `create-expo-app` README text and broken screenshots hurts more than it helps. **Fix**: Polish two strong, original apps with clear documentation instead of uploading ten unfinished templates.
- **Memorizing buzzwords without hands-on depth**: Interviewers quickly spot candidates who repeat "JSI is faster than the bridge" without being able to explain serialization overhead or walk through a real profiling session. **Fix**: Connect every architectural term back to code you actually built and measured.
- **Neglecting native mobile fundamentals**: Even in Expo apps, understanding iOS signing/TestFlight, Android `.aab` bundles, permissions, and app lifecycle states sets you apart from web-only developers. **Fix**: Practise building and installing release/`preview` builds on physical devices.
- **Waiting until you feel "100% ready" to contribute or apply**: Nobody knows every API by heart. **Fix**: Ship your capstone, open a small documentation or bug-fix PR, gather real feedback, and iterate in public.

## Best Practices

- **Write short technical case studies**: A 500-word blog post or README section explaining *"How I cut FlatList frame drops and fixed DST streak bugs in PulseTrack"* gives interviewers concrete proof of your engineering judgment.
- **Keep a "brag document"**: Record every bug fixed, performance metric improved, and app shipped—this makes resume updates and performance reviews straightforward.
- **Stay close to official changelogs**: Read every Expo SDK and React Native release post to stay ahead of deprecations and New Architecture improvements.
- **Give back to the community**: Answer a question on GitHub Discussions/Discord, improve a doc page, or contribute an exercise improvement back via [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) for full requirements, acceptance criteria, and hints, then complete [`./exercises/InterviewPrepExercise.ts`](./exercises/InterviewPrepExercise.ts):

- **Beginner**: Implement `filterQuestionsByTopic()` to query a typed interview question bank by topic and optional difficulty ceiling.
- **Intermediate**: Implement `calculateInterviewReadiness()` to compute average mastery, detect weak topics (`< 75%`), and flag critical gaps (`< 60%`).
- **Challenge**: Implement `buildStudyPlan()` to rank interview topics by `(100 - clampedMastery) * interviewWeight` and generate a focused weekly session schedule.

## Solutions

Try implementing all three functions in [`./exercises/InterviewPrepExercise.ts`](./exercises/InterviewPrepExercise.ts) and running `npm run typecheck && npm run lint` before revealing the solution notes below.

<details>
<summary>Click to view solution notes &amp; links</summary>

Compare your work with [`./solutions/InterviewPrepSolution.ts`](./solutions/InterviewPrepSolution.ts):

- `filterQuestionsByTopic` keeps input arrays immutable using `.filter()`.
- `calculateInterviewReadiness` clamps out-of-range percentages safely to `[0, 100]`, sorts weak topics (`< 75%`) ascending by mastery, and requires both `averageMastery >= 80` and zero topics below `60%`.
- `buildStudyPlan` calculates weighted priority scores `(100 - clampedMastery) * safeWeight`, sorts descending, slices cleanly to `Math.floor(sessionsPerWeek)`, and returns `{ sessionNumber, topic, priorityScore }` entries.

</details>

## Mini Project

**Ship Your Public Portfolio Capstone**

Turn your 30-day work into a career-ready showcase:
1. Fork or customize [Project 05: PulseTrack](../../projects/project-05-production-mobile-app/README.md) with at least two unique features of your own.
2. Score it honestly using `scorePortfolioProject()` from `examples/portfolioChecklist.ts` and polish every criterion scoring below `4`.
3. Record a 20-second demo video/GIF, add an architecture diagram to the README, publish a live preview build with EAS (free tier) or local release build, and share your project on GitHub and LinkedIn.

## Key Takeaways

- Career growth in React Native moves from building clean screens (Junior) → owning full features & quality (Mid) → architecting resilient systems & native modules (Senior) → scaling mobile platforms (Staff).
- Two deeply engineered, tested, live-previewable apps beat a dozen half-finished tutorials.
- Publishing a small `create-expo-module` library or contributing focused open-source PRs builds real native understanding and public credibility.
- Prepare for interviews by connecting New Architecture, Hermes bytecode execution, performance, offline sync, native integration, and testing concepts back to real code you shipped.

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
