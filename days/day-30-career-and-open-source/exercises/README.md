# Day 30 Exercises: Interview Prep & Career Study Planner

Complete the three functions in [`InterviewPrepExercise.ts`](./InterviewPrepExercise.ts) to build a typed React Native interview preparation planner.

## Beginner: Filter Interview Questions

Implement `filterQuestionsByTopic(questions, topic, maxDifficulty)` so that:
- It returns only questions matching `topic`.
- If `maxDifficulty` is provided (`1` = Junior, `2` = Mid, `3` = Senior), only include questions with `difficulty <= maxDifficulty`.
- Does not mutate the input array.

## Intermediate: Evaluate Topic Mastery

Implement `calculateInterviewReadiness(topics)` so that:
- `averageMastery` is the rounded mean of `masteryPercent` across all topics (`0` if empty).
- `focusTopics` lists every topic whose `masteryPercent < 75`, sorted ascending by `masteryPercent` (weakest topic first).
- `isInterviewReady` is `true` when `topics.length > 0`, `averageMastery >= 80`, and no topic has `masteryPercent < 60`.

## Challenge: Priority Study Schedule Builder

Implement `buildStudyPlan(topics, sessionsPerWeek)` so that:
- Returns an empty array if `sessionsPerWeek <= 0` or `topics.length === 0`.
- Ranks topics by priority score: `priority = (100 - clampedMastery) * topic.interviewWeight` (highest priority first).
- Picks up to `sessionsPerWeek` topics from the ranked list and returns an ordered array of `{ sessionNumber, topicName, reason }` entries.

## Checking Your Work

Compare your work against [`../solutions/InterviewPrepSolution.ts`](../solutions/InterviewPrepSolution.ts) and verify with `npm run typecheck`.
