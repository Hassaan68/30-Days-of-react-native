# Day 04 Exercises: Precision Stopwatch with Custom Hook

Practice `useState` (functional updates), `useEffect` (interval setup & cleanup), `useRef<TextInputInstance>(null)` (focusing a native `TextInput`), `useMemo`, `useCallback`, and custom hooks.

## How to Practise

1. Open [`./StopwatchExercise.tsx`](./StopwatchExercise.tsx) and complete each `// TODO:` section progressively.
2. Preview your stopwatch interactively via `npm start` from the repository root (or render it inside `app/index.tsx` in your Expo app).
3. Run TypeScript and ESLint checks after each tier to verify `react-hooks/exhaustive-deps` and strict React Native 0.88 types:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### 1. Beginner — Start, Pause, Reset & Timer Cleanup

**Requirements**
- Inside `useEffect`, start a `100ms` interval (`setInterval`) whenever `isRunning` is `true`, incrementing `elapsedMs` using a functional updater (`(prev) => prev + 100`).
- Return a cleanup function that calls `clearInterval(intervalId)` when `isRunning` becomes `false` or the component unmounts.
- Ensure `handleReset` stops the timer, resets `elapsedMs` back to `0`, and clears all recorded `laps`.

**Acceptance Criteria**
- [ ] Pressing **Start** ticks the displayed timer smoothly every 0.1 seconds (`00:00.1`, `00:00.2`, ...).
- [ ] Pressing **Pause** immediately freezes the timer without leaking any background intervals.
- [ ] Pressing **Reset** stops the timer and returns the display to `00:00.0` with an empty lap list.

**Expected Behavior**
- Tapping **Start** toggles the button label to **Pause** and counts upward cleanly; tapping **Pause** holds the elapsed time; tapping **Start** again resumes from where it paused.

<details>
<summary>Hint</summary>

Inside `useEffect`:
```tsx
useEffect(() => {
  if (!isRunning) {
    return;
  }
  const intervalId = setInterval(() => {
    setElapsedMs((prev) => prev + 100);
  }, 100);

  return () => {
    clearInterval(intervalId);
  };
}, [isRunning]);
```

</details>

---

### 2. Intermediate — Lap Recording & Derived Fastest Lap

**Requirements**
- Complete `handleRecordLap` so pressing **Lap** (when `elapsedMs > 0`) creates a new `LapEntry` (`id`, `lapNumber`, `splitMs`, `totalMs`, `note`), prepends it immutably to `laps` (newest lap on top), and clears `note`.
- Compute `splitMs` as the difference between `elapsedMs` and the most recent lap's `totalMs` (defaulting to `0` for the first lap, guarded safely for `noUncheckedIndexedAccess`).
- Compute `fastestSplitMs` using `useMemo` (or pure render derivation) from `laps` — **without** adding a `useEffect` or extra `useState`.

**Acceptance Criteria**
- [ ] Pressing **Lap** when the timer is at `00:00.0` does nothing.
- [ ] Recorded laps appear in reverse chronological order (`Lap 3`, `Lap 2`, `Lap 1`) with accurate individual split durations.
- [ ] `Fastest Lap: MM:SS.d` appears automatically once at least one lap is recorded and updates whenever a faster split is logged.
- [ ] No `useEffect` is used to synchronize `fastestSplitMs`.

**Expected Behavior**
- If you tap **Lap** at `00:03.0` and again at `00:05.0`, Lap 1 has a split of `00:03.0`, Lap 2 has a split of `00:02.0`, and the fastest lap badge displays `Fastest Lap: 00:02.0`.

<details>
<summary>Hint</summary>

Because the newest lap is prepended at index `0`, read `const lastLap = previousLaps[0];` and compute `const previousTotalMs = lastLap ? lastLap.totalMs : 0;`. For `fastestSplitMs`, guard `const firstLap = laps[0]; if (!firstLap) return null;` and use `laps.reduce(...)` inside `useMemo`.

</details>

---

### 3. Challenge — Custom Hook `useStopwatch` & `TextInputInstance` Ref

**Requirements**
- Extract the stopwatch state (`elapsedMs`, `isRunning`, `laps`), the `useEffect` interval, the `fastestSplitMs` memo, and `useCallback`-stabilized handlers (`toggleRunning`, `recordLap`, `reset`) into a reusable, strictly typed `useStopwatch()` custom hook inside the file.
- Wire up `noteInputRef = useRef<TextInputInstance>(null)` (importing `type TextInputInstance` from `'react-native'`) so tapping the **Focus / Add Note** button calls `noteInputRef.current?.focus()`.
- Clear the `note` text input cleanly right after recording a lap.

**Acceptance Criteria**
- [ ] `useStopwatch()` has an explicit TypeScript return interface (`UseStopwatchResult`) and contains all timer/lap logic cleanly separated from the UI component.
- [ ] `noteInputRef` uses `useRef<TextInputInstance>(null)` (never `useRef<TextInput>(null)`).
- [ ] Pressing **Focus** focuses the `TextInput`, and submitting or pressing **Lap** attaches the trimmed note to the new lap and clears the field.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors or hook-dependency warnings.

**Expected Behavior**
- Typing `"Sprint 1"` in the note input and tapping **Lap** records `Lap 1` with `"Sprint 1"` attached and clears the input for the next lap, while tapping **Focus** opens the keyboard immediately.

<details>
<summary>Hint</summary>

Keep the `note` input state and `noteInputRef` inside the UI component, and pass `note` as an argument to `recordLap(note)` returned by `useStopwatch()`:
```tsx
const { elapsedMs, isRunning, laps, fastestSplitMs, toggleRunning, recordLap, reset } =
  useStopwatch();
const noteInputRef = useRef<TextInputInstance>(null);
```

</details>

## Reference Solution

<details>
<summary>Only after trying: view reference solution link</summary>

Compare your implementation with [`../solutions/StopwatchSolution.tsx`](../solutions/StopwatchSolution.tsx).

</details>
