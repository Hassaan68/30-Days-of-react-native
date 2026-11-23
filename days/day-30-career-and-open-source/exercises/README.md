# Day 30 Exercises: Interview Prep & Career Study Planner

## How to Practise

1. Open the starter file [`InterviewPrepExercise.ts`](./InterviewPrepExercise.ts) and replace each `// TODO:` while keeping every exported type and function signature intact.
2. Run strict type checking and linting from the repository root:
   ```bash
   npm run typecheck
   npm run lint
   ```
3. Optional: Create a short Jest test or scratch runner that feeds your own honest mastery scores across all five React Native interview topics (`new-architecture`, `performance`, `offline-sync`, `native-modules`, `testing`) to generate your real study plan!

---

## Beginner: Filter Interview Questions

### Requirements

Implement `filterQuestionsByTopic(questions, topic, maxDifficulty)` so that:
- It returns only questions whose `question.topic === topic`.
- If `maxDifficulty` is provided (`1` = Junior, `2` = Mid, `3` = Senior), only include questions with `question.difficulty <= maxDifficulty`.
- Does not mutate the input `questions` array.

### Acceptance Criteria

- [ ] Returns all questions for the requested `topic` when `maxDifficulty` is `undefined`.
- [ ] Excludes questions with `difficulty > maxDifficulty` when a difficulty ceiling is passed.
- [ ] Returns an empty array `[]` if no questions match, without mutating `questions`.

### Expected Behavior

```ts
filterQuestionsByTopic(bank, 'performance')    // -> all 'performance' questions (levels 1–3)
filterQuestionsByTopic(bank, 'performance', 2) // -> only 'performance' questions with difficulty 1 or 2
```

<details>
<summary>Hint</summary>

Use `questions.filter(...)` checking `question.topic === topic` first, then `maxDifficulty === undefined || question.difficulty <= maxDifficulty`.

</details>

---

## Intermediate: Evaluate Topic Mastery

### Requirements

Implement `calculateInterviewReadiness(topics)` so that:
- If `topics` is empty, return `{ averageMastery: 0, focusTopics: [], isInterviewReady: false }`.
- Clamp each topic's `masteryPercent` to `[0, 100]` before computing metrics.
- `averageMastery` is the rounded mean (`Math.round`) of clamped `masteryPercent` across all topics.
- `focusTopics` lists the `topic` names of every entry whose clamped `masteryPercent < 75`, sorted ascending by mastery (weakest topic first).
- `isInterviewReady` is `true` only when `topics.length > 0`, `averageMastery >= 80`, and **no** topic has clamped `masteryPercent < 60`.

### Acceptance Criteria

- [ ] Handles empty `topics` cleanly with `averageMastery: 0`, `focusTopics: []`, `isInterviewReady: false`.
- [ ] Clamps out-of-range percentages (e.g., `-10` → `0`, `130` → `100`).
- [ ] Orders `focusTopics` from lowest mastery to highest mastery.
- [ ] Returns `isInterviewReady: false` if `averageMastery >= 80` overall but one topic sits at `55%` (critical gap `< 60%`).

### Expected Behavior

```ts
calculateInterviewReadiness([
  { topic: 'performance', masteryPercent: 90, interviewWeight: 5 },
  { topic: 'testing', masteryPercent: 70, interviewWeight: 4 },
  { topic: 'native-modules', masteryPercent: 55, interviewWeight: 3 },
])
// -> { averageMastery: 72, focusTopics: ['native-modules', 'testing'], isInterviewReady: false }
```

<details>
<summary>Hint</summary>

Map `topics` into a normalized array with `Math.min(100, Math.max(0, item.masteryPercent))`. Compute the rounded mean with `.reduce(...)`, filter `< 75` + sort ascending + map to `item.topic` for `focusTopics`, and check `!normalized.some((item) => item.masteryPercent < 60)`.

</details>

---

## Challenge: Priority Study Schedule Builder

### Requirements

Implement `buildStudyPlan(topics, sessionsPerWeek)` so that:
- Floors `sessionsPerWeek` (`const limit = Math.floor(sessionsPerWeek)`).
- Returns an empty array `[]` if `limit <= 0` or `topics.length === 0`.
- Clamps `masteryPercent` to `[0, 100]` and `interviewWeight` to `>= 0`.
- Ranks topics descending by `priorityScore = (100 - clampedMastery) * safeWeight` (highest-impact study gaps first).
- Slices up to `limit` entries and returns an array of `StudySessionPlan` objects (`{ sessionNumber, topic, priorityScore }`) where `sessionNumber` starts at `1`.

### Acceptance Criteria

- [ ] Returns `[]` when `sessionsPerWeek <= 0` or `topics` is empty.
- [ ] Ranks topics with higher `(100 - clampedMastery) * safeWeight` first.
- [ ] Returns at most `Math.floor(sessionsPerWeek)` sessions with 1-based `sessionNumber` values.
- [ ] Matches the `StudySessionPlan` interface (`{ sessionNumber, topic, priorityScore }`).

### Expected Behavior

```ts
buildStudyPlan(
  [
    { topic: 'new-architecture', masteryPercent: 60, interviewWeight: 5 }, // priority: 200
    { topic: 'testing', masteryPercent: 85, interviewWeight: 4 },          // priority: 60
    { topic: 'offline-sync', masteryPercent: 50, interviewWeight: 5 },     // priority: 250
  ],
  2,
)
// -> [
//   { sessionNumber: 1, topic: 'offline-sync', priorityScore: 250 },
//   { sessionNumber: 2, topic: 'new-architecture', priorityScore: 200 },
// ]
```

<details>
<summary>Hint</summary>

Map each topic to `{ topic: item.topic, priorityScore: (100 - clampedMastery) * safeWeight }`, sort descending with `.sort((a, b) => b.priorityScore - a.priorityScore)`, then `.slice(0, limit).map((entry, index) => ({ sessionNumber: index + 1, ...entry }))`.

</details>

---

## Solutions (Open Only After Trying)

<details>
<summary>Click to reveal solution link</summary>

Compare your work against [`../solutions/InterviewPrepSolution.ts`](../solutions/InterviewPrepSolution.ts) and verify with `npm run typecheck && npm run lint`.

</details>
