export type SkillCategory = 'Mobile' | 'Frontend' | 'Backend' | 'Tools';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly category: SkillCategory;
  readonly level: SkillLevel;
  readonly yearsOfExperience: number;
  readonly summary: string;
}

export interface SocialLink {
  readonly id: string;
  readonly platform: string;
  readonly handle: string;
  readonly url: string;
}

export interface ExperienceItem {
  readonly id: string;
  readonly role: string;
  readonly company: string;
  readonly period: string;
  readonly location: string;
  readonly highlights: readonly string[];
}

export interface DeveloperStats {
  readonly projectsShipped: number;
  readonly openSourceRepos: number;
  readonly followers: number;
}

export interface DeveloperProfile {
  readonly fullName: string;
  readonly roleTitle: string;
  readonly location: string;
  readonly email: string;
  readonly avatarUrl: string;
  readonly isAvailableForWork: boolean;
  readonly headline: string;
  readonly bio: string;
  readonly stats: DeveloperStats;
  readonly skills: readonly Skill[];
  readonly socialLinks: readonly SocialLink[];
  readonly experience: readonly ExperienceItem[];
  readonly engineeringValues: readonly string[];
}

export type ActiveTab = 'profile' | 'about';
