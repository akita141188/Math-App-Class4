export type ContentStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED' | 'ARCHIVED';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GradeSummary {
  id: string;
  grade: number;
  name: string;
  description: string;
}

export interface CurriculumDomain {
  id: string;
  gradeId: string;
  name: string;
  description: string;
  order: number;
  topicCount: number;
}

export interface CurriculumTopic {
  id: string;
  domainId?: string;
  name: string;
  description?: string;
  skill: string;
  order?: number;
  problemTypeCount?: number;
}

export interface CurriculumSkill {
  id: string;
  topicId: string;
  name: string;
  prerequisiteSkillIds: string[];
  misconceptionCodes: string[];
}

export interface ProblemTypeSummary {
  id: string;
  skillId: string;
  topicId: string;
  domainId: string;
  name: string;
  description: string;
  supportedDifficulties: Difficulty[];
  difficultyCounts: Record<Difficulty, number>;
  questionCount: number;
  visualQuestionCount: number;
}

export interface CurriculumCatalog {
  grade: GradeSummary;
  domains: CurriculumDomain[];
  topics: CurriculumTopic[];
  skills: CurriculumSkill[];
  problemTypes: ProblemTypeSummary[];
}
