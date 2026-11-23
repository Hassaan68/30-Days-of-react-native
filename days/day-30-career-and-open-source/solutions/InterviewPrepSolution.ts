/**
 * Day 30 Solution: React Native Interview Prep Planner
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

export function filterQuestionsByTopic(
  questions: readonly InterviewQuestion[],
  topic: InterviewTopicArea,
  maxDifficulty?: DifficultyLevel,
): InterviewQuestion[] {
  return questions.filter((question) => {
    if (question.topic !== topic) {
      return false;
    }
    if (maxDifficulty !== undefined && question.difficulty > maxDifficulty) {
      return false;
    }
    return true;
  });
}

export function calculateInterviewReadiness(
  topics: readonly TopicMastery[],
): ReadinessSummary {
  if (topics.length === 0) {
    return {
      averageMastery: 0,
      focusTopics: [],
      isInterviewReady: false,
    };
  }

  const normalized = topics.map((item) => ({
    ...item,
    masteryPercent: Math.min(100, Math.max(0, item.masteryPercent)),
  }));

  const totalMastery = normalized.reduce((sum, item) => sum + item.masteryPercent, 0);
  const averageMastery = Math.round(totalMastery / normalized.length);

  const focusTopics = normalized
    .filter((item) => item.masteryPercent < 75)
    .sort((a, b) => a.masteryPercent - b.masteryPercent)
    .map((item) => item.topic);

  const hasCriticalGap = normalized.some((item) => item.masteryPercent < 60);
  const isInterviewReady = averageMastery >= 80 && !hasCriticalGap;

  return {
    averageMastery,
    focusTopics,
    isInterviewReady,
  };
}

export function buildStudyPlan(
  topics: readonly TopicMastery[],
  sessionsPerWeek: number,
): StudySessionPlan[] {
  const limit = Math.floor(sessionsPerWeek);
  if (limit <= 0 || topics.length === 0) {
    return [];
  }

  const ranked = topics
    .map((item) => {
      const clampedMastery = Math.min(100, Math.max(0, item.masteryPercent));
      const safeWeight = Math.max(0, item.interviewWeight);
      const priorityScore = (100 - clampedMastery) * safeWeight;
      return {
        topic: item.topic,
        priorityScore,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return ranked.slice(0, limit).map((entry, index) => ({
    sessionNumber: index + 1,
    topic: entry.topic,
    priorityScore: entry.priorityScore,
  }));
}
