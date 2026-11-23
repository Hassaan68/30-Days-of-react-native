# Day 04 Exercises: Precision Stopwatch with Custom Hook

Practice `useState` (functional updates), `useEffect` (interval setup & cleanup), `useRef` (focusing a `TextInput`), `useMemo`, `useCallback`, and custom hooks.

## Starter File

Open [`./StopwatchExercise.tsx`](./StopwatchExercise.tsx) and complete the `// TODO:` sections.

## Tasks

### 1. Beginner — Start, Pause, Reset & Timer Cleanup
- Inside `useEffect`, start a `100ms` interval whenever `isRunning` is `true` that increments `elapsedMs` via a functional updater (`(prev) => prev + 100`).
- Return a cleanup function (`clearInterval`) so pausing or unmounting never leaks timers.
- Implement `handleReset` to stop the timer, reset `elapsedMs` to `0`, and clear all recorded laps.

### 2. Intermediate — Lap Recording & Derived Fastest Lap
- Implement `handleRecordLap` so pressing **Lap** (while elapsed time > 0) prepends a new `LapEntry` (`id`, `splitMs`, `totalMs`, `note`) immutably.
- Compute `fastestLapMs` using `useMemo` (or derived computation) instead of adding a `useEffect`.

### 3. Challenge — Custom Hook `useStopwatch` & `TextInput` Ref
- Extract the stopwatch state, interval effect, and `useCallback` handlers into a reusable `useStopwatch()` custom hook.
- Wire up `noteInputRef = useRef<TextInput | null>(null)` so tapping **"Focus Note"** focuses the lap note input, and recording a lap clears the note text cleanly.

## Checking Your Work

Compare your implementation with [`../solutions/StopwatchSolution.tsx`](../solutions/StopwatchSolution.tsx).
