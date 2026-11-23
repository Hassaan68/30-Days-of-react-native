# Day 02: JavaScript and TypeScript for React Native

Before diving deep into React components and mobile UI, you need rock-solid command of **modern JavaScript (ES2022+)** and **strict TypeScript**. Almost every React Native API, Expo SDK module, and navigation route uses TypeScript types to prevent runtime crashes on users' phones. Today you will master the exact language patterns you will write every single day as a React Native developer.

## Learning Objectives

By the end of Day 02, you will be able to:

- Use `const` and `let` correctly and write concise functions and arrow functions.
- Transform immutable data cleanly with `map`, `filter`, `reduce`, destructuring, and spread/rest operators.
- Handle asynchronous operations reliably using Promises, `async`/`await`, and `try`/`catch`.
- Model mobile app data with TypeScript primitives, interfaces, type aliases, and literal unions.
- Write reusable, type-safe utilities using **generics** and **discriminated unions** (for loading/success/error states).
- Handle strict TypeScript settings—especially `strict: true` and `noUncheckedIndexedAccess: true`—without ever resorting to `any`.

## Prerequisites

- Completed [Day 01: Introduction to React Native and Expo](../day-01-introduction/README.md).
- Basic familiarity with variables, loops, and conditionals in any programming language.

## Introduction

React Native 0.88 enables its **Strict TypeScript API** by default, and Expo SDK 58 templates ship with TypeScript configured out of the box. Why? On the web, a crash in one widget might just log an error in the browser console; on mobile, an unhandled `undefined is not an object` error can crash the entire native app to the home screen.

TypeScript acts like a co-pilot that catches missing properties, invalid navigation params, and unchecked array lookups directly in your editor before your code ever runs on a device.

## Concepts

### 1. Variables (`const` & `let`) and Arrow Functions

- Prefer **`const`** by default so bindings cannot be accidentally reassigned. Remember that `const` prevents reassigning the variable reference, not mutating object properties—in React we treat objects and arrays as immutable anyway.
- Use **`let`** only when a variable genuinely needs reassignment (such as a loop counter or accumulator). Avoid `var` completely.
- **Arrow functions** (`(a, b) => a + b`) provide concise syntax for inline callbacks (`map`, `filter`, `onPress` handlers) and lexically capture `this`.

```ts
const appName = '30 Days of React Native';
let completedLessons = 1;
completedLessons += 1;

const calculateProgress = (done: number, total: number): number =>
  total === 0 ? 0 : Math.round((done / total) * 100);
```

### 2. Immutability: Destructuring, Spread/Rest, and Array Methods

React detects UI updates by comparing object and array references. Instead of mutating arrays with `.push()` or `.splice()`, React Native developers create new copies using **spread (`...`)** and pure array methods:

- **Destructuring:** Unpack properties from objects or elements from arrays cleanly.
- **Spread (`...`):** Clone or merge objects and arrays immutably.
- **Rest (`...rest`):** Collect remaining properties or function arguments.
- **`map`:** Transform every item into a new array of the same length (essential for rendering lists of components).
- **`filter`:** Keep only items that match a predicate.
- **`reduce`:** Fold an array into a single summary value (totals, grouped maps, counts).

```ts
const user = { id: 'u1', name: 'Maya', streak: 4, role: 'learner' };
const { name, ...restOfUser } = user;
const updatedUser = { ...user, streak: user.streak + 1 };
```

### 3. Promises and `async` / `await`

Mobile apps constantly wait on asynchronous work: fetching JSON from an API, reading secure storage, requesting camera permissions, or querying SQLite.

A **`Promise<T>`** represents a future value of type `T`. **`async` / `await`** lets you write asynchronous flows that read top-to-bottom like synchronous code while handling errors cleanly with `try` / `catch`:

```ts
async function loadLessonTitle(day: number): Promise<string> {
  if (day < 1 || day > 30) {
    throw new Error(`Invalid day number: ${day}`);
  }
  return `Day ${String(day).padStart(2, '0')} Lesson`;
}
```

Use `Promise.all([...])` when independent requests can run concurrently rather than waiting one by one.

### 4. TypeScript Interfaces vs. Type Aliases

TypeScript lets you describe the exact shape of your app's data:

- **`interface`**: Ideal for describing object shapes and component props; supports declaration merging and `extends`.
- **`type` (type alias)**: Can name **any** type—object shapes, primitives, tuples, function signatures, and **union types** (`'idle' | 'loading' | 'error'`).

```ts
export interface Lesson {
  readonly id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
```

### 5. Discriminated Unions (Modeling UI State Safely)

One of the highest-impact TypeScript patterns in React Native is the **discriminated union**—a union of object types sharing a common literal tag property (commonly `status` or `kind`).

Instead of messy boolean flags like `{ isLoading: boolean; error: string | null; data: User | null }` (which allow impossible states like loading AND having an error at the same time), model every state explicitly:

```ts
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```

When you switch on `state.status`, TypeScript automatically **narrows** the type so `state.data` is guaranteed to exist in the `'success'` branch and `state.message` is guaranteed to exist in the `'error'` branch!

### 6. Generics

**Generics** (`<T>`) let you write functions and data structures that work across any type while preserving full type safety—no `any` required:

```ts
export function firstItem<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

When called with `firstItem(['iOS', 'Android'])`, TypeScript infers the return type as `string | undefined`. When called with `firstItem([10, 20])`, it infers `number | undefined`.

### 7. Strict Mode and `noUncheckedIndexedAccess`

This repository enables two critical flags in `tsconfig.json`:

1. **`"strict": true`**: Enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and more.
2. **`"noUncheckedIndexedAccess": true`**: Indexing an array (`items[0]`) or dictionary (`record[key]`) produces `T | undefined` instead of blindly assuming `T` exists.

```ts
function getFirstTitle(titles: readonly string[]): string {
  const first = titles[0];
  if (first === undefined) {
    return 'No titles yet';
  }
  return first.toUpperCase();
}
```

Checking for `undefined` before accessing properties prevents one of the most common mobile app crash categories.

## Code Examples

Explore both example files in `./examples/`:

1. [`./examples/typescriptBasics.ts`](./examples/typescriptBasics.ts) — Demonstrates interfaces, type aliases, immutable updates, `map`/`filter`/`reduce`, destructuring, spread/rest, and safe indexing under `noUncheckedIndexedAccess`.
2. [`./examples/asyncAndGenerics.ts`](./examples/asyncAndGenerics.ts) — Demonstrates generics (`ApiResponse<T>`, `AsyncState<T>`, `groupBy<T, K>`), discriminated union exhaustiveness checks, Promises, and `async`/`await` with `try`/`catch`.

Here is a highlight from [`./examples/asyncAndGenerics.ts`](./examples/asyncAndGenerics.ts):

```ts
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export function describeAsyncState<T>(
  state: AsyncState<T>,
  formatData: (data: T) => string,
): string {
  switch (state.status) {
    case 'idle':
      return 'Ready to load.';
    case 'loading':
      return 'Loading...';
    case 'success':
      return formatData(state.data);
    case 'error':
      return `Error: ${state.message}`;
  }
}
```

## Step-by-Step Explanation

1. **Modeling Domain Entities (`Lesson`, `Difficulty`):** In `typescriptBasics.ts`, we define a `Lesson` interface with explicit primitive types and a union `Difficulty` so invalid strings like `'super-easy'` fail at compile time.
2. **Pure Data Pipelines:** Functions like `getIncompleteLessonTitles` and `getTotalCompletedMinutes` use `.filter()`, `.map()`, and `.reduce()` without ever mutating the input array.
3. **Immutable Updates with Spread:** `markLessonCompleted` returns a brand-new array where only the matching lesson object is cloned with `{ ...lesson, completed: true }`. This mirrors how you will update state in React hooks on Day 03 and Day 04.
4. **Safe Indexed Access:** `getNextLesson` accesses `remaining[0]` and explicitly handles the `undefined` case because `noUncheckedIndexedAccess` is enabled.
5. **Typed Async Fetching & Generics:** In `asyncAndGenerics.ts`, `fetchLessonById` returns `Promise<ApiResponse<LessonSummary>>`. Using `unknown` in `catch (error: unknown)` and narrowing with `error instanceof Error` keeps error handling 100% type-safe without `any`.

## Common Mistakes

1. **Using `any` to silence compiler errors:** `any` disables type checking everywhere it spreads. Use explicit interfaces, generics `<T>`, or `unknown` (with narrowing) instead.
2. **Mutating arrays or objects in place:** Doing `lessons.push(newLesson)` or `lesson.completed = true` inside React state breaks re-rendering. Always return new objects/arrays using spread syntax or `map`/`filter`.
3. **Forgetting `await` on async functions:** Calling `const data = fetchUser()` without `await` gives you a `Promise<User>`, not a `User`.
4. **Ignoring `undefined` from array indexing:** Assuming `items[0].name` is safe crashes whenever `items` is empty. Guard with `const first = items[0]; if (!first) return ...;` or optional chaining (`items[0]?.name`).
5. **Typing `catch (error: any)`:** In strict TypeScript, caught errors are `unknown`. Check `error instanceof Error ? error.message : 'Unexpected error'`.

## Best Practices

- **Keep data transformations as pure TypeScript functions** outside your React components so they are effortless to read, reuse, and unit test.
- **Model complex screen states with discriminated unions** (`idle | loading | success | error`) instead of multiple booleans.
- **Mark input collections as `readonly T[]`** in helper functions so TypeScript prevents accidental mutation.
- **Let TypeScript infer local variables**, while adding explicit parameter and return types to exported functions and component props.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete the tasks in [`./exercises/typeChallenges.ts`](./exercises/typeChallenges.ts).

### Beginner
Implement `formatUserGreeting` (using destructuring and default values) and `getActiveTaskTitles` (using `filter` and `map` on a strictly typed `Task[]` array).

### Intermediate
Implement `toggleTaskById` (immutably updating a single task with spread syntax) and `getTaskStats` (using `reduce` to return `{ total, completed, remaining }`).

### Challenge
Implement the generic function `pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][]`, implement `renderRequestStatus<T>` using a discriminated union `RequestState<T>`, and write an `async` function `fetchTaskSafely` that handles errors safely with `unknown` narrowing and `noUncheckedIndexedAccess`.

## Solutions

After attempting the challenges, review the reference solution:

- [`./solutions/typeChallengesSolution.ts`](./solutions/typeChallengesSolution.ts): Strictly typed implementations of every Beginner, Intermediate, and Challenge function with zero `any` and full `noUncheckedIndexedAccess` safety.

## Mini Project

**Typed Course Progress Engine:** Create a standalone TypeScript module (`courseEngine.ts`) in your scratchpad or Day 01 Expo app that defines a `Module` interface, stores an array of 5 curriculum modules, and exports pure functions to:
1. Mark a module as complete immutably.
2. Calculate overall completion percentage with `reduce`.
3. Find the next recommended module safely (returning `Module | undefined`).
4. Represent loading/saving progress using a discriminated union `AsyncState<Module[]>`.

## Key Takeaways

- Modern React Native relies heavily on immutable JavaScript patterns (`const`, destructuring, spread, `map`, `filter`, `reduce`) and `async`/`await`.
- Interfaces, type aliases, generics, and discriminated unions turn entire classes of mobile runtime crashes into instant compile-time checks.
- Never use `any`—rely on generics and `unknown` narrowing instead.
- Respect `noUncheckedIndexedAccess` by always guarding indexed lookups against `undefined`.

## Further Reading

- [TypeScript Official Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Native — Using TypeScript](https://reactnative.dev/docs/typescript)
- [Expo — TypeScript Guide](https://docs.expo.dev/guides/typescript/)
- [MDN — Using Promises and async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

## Progress Checklist

- [ ] Practiced `const`/`let`, arrow functions, destructuring, and spread/rest
- [ ] Wrote immutable transformations with `map`, `filter`, and `reduce`
- [ ] Understood `interface`, `type`, generics, and discriminated unions
- [ ] Handled `noUncheckedIndexedAccess` safely without `any`
- [ ] Completed all challenges in `./exercises/typeChallenges.ts` and checked `./solutions/typeChallengesSolution.ts`

## Next Day

Now that your TypeScript foundation is sharp, let's build reusable UI with React! Continue to **[Day 03: React Fundamentals](../day-03-react-fundamentals/README.md)**.
