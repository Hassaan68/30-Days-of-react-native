# Frequently Asked Questions (FAQ)

Answers to the most common questions learners ask before and during **30 Days of React Native**.

---

### 1. Why does this curriculum use Expo instead of the "bare" React Native CLI?

The official React Native documentation recommends starting with a framework — specifically **Expo** — for nearly all new apps. Expo SDK 58 gives you file-based navigation (Expo Router), first-party native APIs (`expo-camera`, `expo-image`, `expo-secure-store`, `expo-sqlite`), Continuous Native Generation (CNG), and cloud builds (EAS) while still letting you write any custom Swift, Objective-C, Kotlin, or C++ native module whenever needed.

---

### 2. Do I need a Mac to learn React Native and build iOS apps?

**No, not to learn or ship!**
- On **Windows** or **Linux**, you can run the Android Emulator locally and test on a physical **iPhone** using **Expo Go**.
- When you are ready to create production iOS `.ipa` builds and submit to the Apple App Store, **EAS Build** compiles your iOS app in the cloud on macOS runners (covered in [Day 27](../days/day-27-cicd-and-deployment/README.md)).
- You only need a Mac if you want to run the **iOS Simulator** locally or debug native Xcode projects directly on your machine.

---

### 3. What are the limits of Expo Go, and when do I need a Development Build?

Expo Go includes a curated bundle of Expo SDK 58 native modules — more than enough for Days 01–18 and most prototypes. When you add third-party native modules outside Expo Go, configure custom native entitlements (such as custom push extensions or widgets), or test exact production native settings, switch to a **Development Build** (`expo-dev-client`). See the comparison table in [Environment Setup Guide](./SETUP.md).

---

### 4. Should I learn React Native with TypeScript or JavaScript?

**TypeScript.** React Native 0.88 ships with its Strict TypeScript API enabled by default, Expo Router generates strongly typed routes, and almost every production mobile team uses TypeScript. If you are new to TypeScript, [Day 02: JavaScript & TypeScript](../days/day-02-javascript-typescript/README.md) teaches the exact strict TypeScript patterns you need for mobile development.

---

### 5. Do I need to know React before starting Day 01?

Knowing basic JavaScript (variables, functions, arrays, objects, promises) helps, but you do not need prior React experience. [Day 03: React Fundamentals](../days/day-03-react-fundamentals/README.md) and [Day 04: React Hooks](../days/day-04-react-hooks/README.md) teach React 19 from first principles in a mobile context. If you already know React for the web, follow the **React Web Developer Transition** track in [Learning Paths](./LEARNING_PATH.md).

---

### 6. How long does each day take?

Most daily lessons take **60 to 90 minutes**:
- ~20–30 minutes reading the tutorial and studying the `examples/`
- ~25–35 minutes completing the `exercises/` starter code
- ~15–25 minutes building or extending the Mini Project

Workshop days (Days 07, 14, 21, and 29) and the 5 standalone projects take **2 to 4 hours** depending on how many stretch goals you add.

---

### 7. What if I miss a day or cannot study 30 days in a row?

Treat "30 Days" as **30 structured learning units**, not a rigid calendar streak. Doing 3–5 lessons per week with real hands-on practice is far better than rushing through lessons without writing code.

---

### 8. How does React Native compare to Flutter?

Both are mature, production-proven cross-platform frameworks:
- **React Native** renders real platform native views (UIKit/Android Views) using JavaScript/TypeScript and React 19, letting web React engineers share skills, state libraries, and business logic seamlessly.
- **Flutter** uses Dart and renders its own custom UI canvas via Impeller.

If you already know (or want to work in) the JavaScript/TypeScript/React ecosystem, React Native + Expo gives you unmatched leverage across web and mobile teams.

---

### 9. Why do exercises use starter files that already compile?

Every starter file inside `days/day-XX-.../exercises/` is a strictly typed skeleton with `// TODO:` markers so that running `npm run typecheck` and `npm run lint` passes out of the box. As you replace the `// TODO:` sections with your implementation, TypeScript immediately guides you with autocomplete and type checking.

---

### 10. Why does this repo forbid `SafeAreaView` from `react-native` and `AsyncStorage` from `react-native`?

Both were deprecated in favor of dedicated community/Expo packages:
- Always import `SafeAreaView` and `SafeAreaProvider` from `react-native-safe-area-context` (works reliably on both iOS and Android Edge-to-Edge screens).
- Always import `AsyncStorage` from `@react-native-async-storage/async-storage`.

See the full list in [Roadmap — Deprecated APIs Strictly Avoided](./ROADMAP.md).

---

### 11. Why does the repo use `Pressable` instead of `TouchableOpacity`?

`Pressable` is React Native's modern, extensible touch primitive. It exposes `pressed` state directly in its `style` and `children` callbacks, supports `hitSlop` and accessibility props cleanly, and avoids the extra opacity-wrapper view overhead of `TouchableOpacity`.

---

### 12. Are these code examples runnable on Web as well as iOS and Android?

Many core UI, navigation, state, and form examples work in the browser with `npm run web`, thanks to Expo's universal runtime. However, hardware-dependent lessons (camera, haptics, secure enclave, push notifications, SQLite) are designed primarily for **iOS and Android**.

---

### 13. Why is `noUncheckedIndexedAccess` enabled in `tsconfig.json`?

Indexing an array like `tasks[0]` can return `undefined` at runtime when the array is empty. Enabling `noUncheckedIndexedAccess: true` forces you to check for `undefined` before reading properties, eliminating one of the most common runtime crash categories in production mobile apps.

---

### 14. Can I use the 5 capstone projects in my developer portfolio?

**Yes!** The curriculum is MIT-licensed. Even better: customize the UI, connect a real backend or extra features, write clean README screenshots/GIFs, and deploy a preview build with EAS so recruiters and hiring managers can test your work. See [Day 30: Career & Open Source](../days/day-30-career-and-open-source/README.md) for portfolio tips.

---

### 15. How can I track my progress through the curriculum?

Check off items in each day's `## Progress Checklist` section, and run:

```bash
npm run progress
```

---

### 16. How can I contribute fixes, new exercises, or translations?

We welcome contributions of all sizes — from fixing a typo to adding new exercises or improving explanations! Read [CONTRIBUTING.md](../CONTRIBUTING.md) to get started.
