export type MasteryLevel = 'NEW' | 'LEARNING' | 'PRACTICING' | 'CONFIDENT' | 'NEEDS_REVIEW';

export interface SkillProgress {
  skillId: string;
  attempts: number;
  correct: number;
  incorrect: number;
  independentCorrect: number;
  hintedCorrect: number;
  lastPracticedAt: string;
  recentMistakes: string[];
  masteryLevel: MasteryLevel;
}

export interface ProgressSummary {
  totalQuestions: number;
  independentCorrect: number;
  hintedCorrect: number;
  skills: SkillProgress[];
}
