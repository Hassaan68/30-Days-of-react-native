/**
 * Day 30 Example: Mobile Portfolio Evaluator & Career Roadmap Reference
 *
 * Provides a structured, weighted rubric for self-reviewing your capstone
 * React Native projects before sharing them with hiring managers or clients.
 */

export type CareerLevel = 'junior' | 'mid' | 'senior' | 'staff';

export type RubricCategory =
  | 'architecture'
  | 'ui-ux-accessibility'
  | 'reliability-testing'
  | 'shipping-devops'
  | 'documentation';

export interface PortfolioRubricCriterion {
  readonly id: string;
  readonly category: RubricCategory;
  readonly title: string;
  readonly weight: number;
  readonly score: number; // 0 to 5
}

export type PortfolioGrade = 'Portfolio Ready' | 'Strong Foundation' | 'Needs Polish';

export interface ProjectReviewResult {
  readonly weightedScore: number;
  readonly maxWeightedScore: number;
  readonly percentage: number;
  readonly grade: PortfolioGrade;
  readonly strengths: readonly string[];
  readonly improvements: readonly string[];
}

export interface CareerMilestone {
  readonly level: CareerLevel;
  readonly focusAreas: readonly string[];
  readonly portfolioSignal: string;
}

export const CAREER_ROADMAP: readonly CareerMilestone[] = [
  {
    level: 'junior',
    focusAreas: [
      'Core components, Flexbox layouts, TypeScript basics',
      'Expo Router navigation, REST API calls, form validation',
      'Clean Git commits and readable pull requests',
    ],
    portfolioSignal: '2-3 polished apps with live Expo previews, zero TypeScript errors, and clear READMEs.',
  },
  {
    level: 'mid',
    focusAreas: [
      'TanStack Query, Zustand, offline persistence, secure authentication',
      '60fps list optimization, Reanimated gestures, accessibility',
      'Automated Jest + React Native Testing Library coverage and EAS CI/CD',
    ],
    portfolioSignal: 'An end-to-end production app (like PulseTrack) with tests, CI workflow, and TestFlight/APK build.',
  },
  {
    level: 'senior',
    focusAreas: [
      'App architecture, New Architecture (JSI/Fabric/TurboModules), custom Expo Modules',
      'Release engineering, crash monitoring, performance profiling, security audits',
      'Mentoring teammates and writing Architecture Decision Records (ADRs)',
    ],
    portfolioSignal: 'Published open-source Expo module or deep engineering case studies with measurable performance wins.',
  },
  {
    level: 'staff',
    focusAreas: [
      'Cross-org mobile platform strategy, monorepos, design systems, brownfield integration',
      'Release reliability at scale, telemetry standards, build pipeline speed',
      'Driving technical direction across iOS, Android, and backend teams',
    ],
    portfolioSignal: 'Open-source RFCs, conference talks/articles, and reusable platform tooling adopted by multiple teams.',
  },
];

export const DEFAULT_CAPSTONE_RUBRIC: readonly PortfolioRubricCriterion[] = [
  {
    id: 'arch-strict-ts',
    category: 'architecture',
    title: 'Strict TypeScript, clean folder boundaries, decoupled domain logic',
    weight: 3,
    score: 5,
  },
  {
    id: 'ui-a11y',
    category: 'ui-ux-accessibility',
    title: 'Responsive layout, safe areas, empty/error states, accessibility roles & labels',
    weight: 3,
    score: 4,
  },
  {
    id: 'tests-ci',
    category: 'reliability-testing',
    title: 'Automated Jest unit/component tests passing in GitHub Actions CI',
    weight: 3,
    score: 5,
  },
  {
    id: 'shipping-eas',
    category: 'shipping-devops',
    title: 'Installable preview build (TestFlight / APK / EAS Update link) with env config',
    weight: 2,
    score: 4,
  },
  {
    id: 'docs-readme',
    category: 'documentation',
    title: 'README with screenshots/demo GIF, architecture diagram, setup steps, and trade-offs',
    weight: 2,
    score: 5,
  },
];

export function scorePortfolioProject(
  criteria: readonly PortfolioRubricCriterion[],
): ProjectReviewResult {
  let weightedScore = 0;
  let maxWeightedScore = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  for (const criterion of criteria) {
    const clampedScore = Math.min(5, Math.max(0, criterion.score));
    const safeWeight = Math.max(0, criterion.weight);

    weightedScore += clampedScore * safeWeight;
    maxWeightedScore += 5 * safeWeight;

    if (clampedScore >= 4) {
      strengths.push(criterion.title);
    } else if (clampedScore <= 2) {
      improvements.push(criterion.title);
    }
  }

  const percentage =
    maxWeightedScore === 0 ? 0 : Math.round((weightedScore / maxWeightedScore) * 100);

  const grade: PortfolioGrade =
    percentage >= 85
      ? 'Portfolio Ready'
      : percentage >= 65
        ? 'Strong Foundation'
        : 'Needs Polish';

  return {
    weightedScore,
    maxWeightedScore,
    percentage,
    grade,
    strengths,
    improvements,
  };
}
