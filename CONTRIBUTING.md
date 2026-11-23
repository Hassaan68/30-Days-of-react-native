# Contributing to 30 Days of React Native

Thank you for helping make **30 Days of React Native** better for learners around the world! Whether you are fixing a typo, improving a beginner explanation, adding an exercise, or updating an API for a future Expo SDK release, your contributions are genuinely appreciated.

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating.

---

## Ways to Contribute

You do not need to be a senior React Native maintainer to contribute meaningfully:

1. **Fix Explanations & Typos:** Clarify confusing paragraphs, fix broken formatting, or improve beginner friendliness.
2. **Improve Code Examples:** Make examples clearer, more idiomatic, or better typed while staying strictly aligned with Expo SDK 58 & React Native 0.88.
3. **Add or Enhance Exercises:** Add extra intermediate or challenge exercises (along with matching starter files and verified solutions).
4. **Update Documentation:** Improve [SETUP.md](./docs/SETUP.md), [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md), [GLOSSARY.md](./docs/GLOSSARY.md), or [FAQ.md](./docs/FAQ.md) with real edge cases you encountered.
5. **Translate Tutorials:** Help bring lessons to non-English-speaking developers (open a Discussion or Content Improvement issue first so maintainers can coordinate folder conventions).
6. **Propose New Topics or Projects:** Suggest bonus guides or capstone extensions via a Feature Request issue.

---

## Local Development Setup

### Prerequisites

- **Node.js `>=22.13.0`** (Node `24` LTS recommended — see `.nvmrc`)
- **npm** (bundled with Node.js)
- **Git**

### Fork, Clone, and Install

```bash
# 1. Fork https://github.com/Hassaan68/30-Days-of-react-native on GitHub, then clone your fork
git clone https://github.com/<your-username>/30-Days-of-react-native.git
cd 30-Days-of-react-native

# 2. Activate the recommended Node version
nvm use || fnm use

# 3. Install dependencies
npm install

# 4. Verify checks locally before making changes
npm run validate:curriculum && npm run validate:links && npm run typecheck && npm run lint
```

---

## Repository Standards & Code Style

All TypeScript and Markdown contributions must follow the repository's quality standards:

### TypeScript & React Native Rules

- **Strict TypeScript:** `strict: true` and `noUncheckedIndexedAccess: true` are enforced in `tsconfig.json`.
- **No `any`:** `@typescript-eslint/no-explicit-any` is an error. Use explicit types or `unknown` with type narrowing.
- **No Unused Variables or Imports:** Prefix intentional unused parameters in starter exercise skeletons with `_` (e.g., `_props`).
- **No Deprecated APIs:**
  - Always import `SafeAreaView` / `SafeAreaProvider` from `react-native-safe-area-context` (never `react-native`).
  - Always import `AsyncStorage` from `@react-native-async-storage/async-storage`.
  - Prefer `Pressable` over `TouchableOpacity`.
  - Never use `expo-av`, `InteractionManager`, `NativeMethods`, `Modal`'s `animated` prop, or deep imports (`react-native/Libraries/*`).
- **Only Installed Packages:** Do not import third-party packages that are not listed in root `package.json` unless you are proposing a dependency change in an issue first.

### Daily Lesson Structure

Every folder in `days/day-XX-.../` must include:
- `README.md` with all required tutorial headings (checked automatically by `npm run validate:curriculum`).
- `examples/` with clean, runnable `.ts`/`.tsx` files.
- `exercises/` with a `README.md` and starter `.ts`/`.tsx` files that compile cleanly under strict TypeScript (`// TODO:` placeholders must still return valid types/JSX).
- `solutions/` with complete working solutions passing TypeScript and ESLint.

### Formatting & Linting

```bash
# Auto-fix ESLint issues
npm run lint:fix

# Format Markdown, TypeScript, and JSON with Prettier
npm run format

# Check formatting without modifying files
npm run format:check
```

---

## Running Validation Scripts

Before opening a Pull Request, run the full validation suite:

```bash
npm run validate:all
```

This single command executes all five CI checks in order:
1. `npm run validate:curriculum` — Ensures all 30 daily folders and 5 projects contain every required directory and heading.
2. `npm run validate:links` — Verifies every internal relative Markdown link and `#anchor` resolves cleanly.
3. `npm run typecheck` — Runs `tsc --noEmit` across all TypeScript files.
4. `npm run lint` — Runs ESLint across the repository.
5. `npm test` — Runs Jest + React Native Testing Library tests.

---

## Commit Guidelines

Use clear, concise [Conventional Commits](https://www.conventionalcommits.org/) so the commit history stays easy to read:

- `docs(day-08): clarify Expo Router modal presentation example`
- `fix(day-16): guard undefined item under noUncheckedIndexedAccess`
- `feat(exercises): add dark mode challenge to Day 05`
- `chore(deps): align packages with Expo SDK 58 patch release`

---

## Pull Request Process

1. Create a focused feature branch from `main`:
   ```bash
   git checkout -b docs/improve-day-05-flexbox
   ```
2. Make your edits and test any changed code examples.
3. Run `npm run validate:all` and confirm every check passes.
4. Open a Pull Request and complete the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
5. Respond to review feedback politely and collaboratively. Maintainers typically review PRs within a few days.

---

## Questions?

If you are unsure whether a larger change fits the curriculum, open an issue or check [SUPPORT.md](./SUPPORT.md) before investing a lot of time — we are happy to help scope it with you!
