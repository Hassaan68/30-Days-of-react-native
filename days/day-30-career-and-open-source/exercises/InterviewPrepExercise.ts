/**
 * Day 30 Starter Exercise: React Native Interview Prep Planner
 *
 * Complete each TODO while preserving all exported types and function signatures.
 */

export type InterviewTopicArea =
  | 'new-architecture'
  | 'performance'
  | 'offline-sync'
  | 'native-modules'
  | 'testing';

export type DifficultyLevel = 1 | 2 | 3;

export interface InterviewQuestion {
  readonly id: string;
  readonly topic: InterviewTopicArea;
  readonly prompt: string;
  readonly difficulty: DifficultyLevel;
}

export interface TopicMastery {
  readonly topic: InterviewTopicArea;
  readonly masteryPercent: number; // 0 to 100
  readonly interviewWeight: number; // 1 to 5
}

export interface ReadinessSummary {
  readonly averageMastery: number;
  readonly focusTopics: readonly InterviewTopicArea[];
  readonly isInterviewReady: boolean;
}

export interface StudySessionPlan {
  readonly sessionNumber: number;
  readonly topic: InterviewTopicArea;
  readonly priorityScore: number;
}

/**
 * Beginner Exercise:
 * Filter interview questions by topic and optional maximum difficulty level.
 */
export function filterQuestionsByTopic(
  _questions: readonly InterviewQuestion[],
  _topic: InterviewTopicArea,
  _maxDifficulty?: DifficultyLevel,
): InterviewQuestion[] {
  // TODO: Filter by matching topic and optional difficulty <= maxDifficulty.
  return [];
}

/**
 * Intermediate Exercise:
 * Calculate overall interview readiness and return weak topics (< 75%) sorted weakest-first.
 */
export function calculateInterviewReadiness(
  _topics: readonly TopicMastery[],
): ReadinessSummary {
  // TODO: Compute averageMastery, sorted focusTopics (< 75%), and isInterviewReady.
  return {
    averageMastery: 0,
    focusTopics: [],
    isInterviewReady: false,
  };
}

/**
 * Challenge Exercise:
 * Build a weekly study plan prioritizing topics with the highest
 * `(100 - clampedMastery) * interviewWeight` score.
 */
export function buildStudyPlan(
  _topics: readonly TopicMastery[],
  _sessionsPerWeek: number,
): StudySessionPlan[] {
  // TODO: Rank topics by priority score descending and select up to sessionsPerWeek entries.
  return [];
}
