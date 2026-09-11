import type { Difficulty } from './curriculum';
import type { AnswerResult, MisconceptionCode, StudentAnswer, StudentQuestion } from './question';

export type PracticeMode = 'PRACTICE' | 'LEARN' | 'REVIEW';
export type DifficultyMode = Difficulty | 'ALL';

export interface RecentQuestionReference {
  questionId: string;
  fingerprint: string;
  problemTypeId: string;
  lastSeenAt: string;
}

export interface CreatePracticeSessionRequest {
  grade: number;
  problemTypeIds: string[];
  difficulty?: DifficultyMode;
  questionCount: number | 'ALL';
  mode: PracticeMode;
  recentQuestions?: RecentQuestionReference[];
  randomSeed?: string;
}

export interface PracticeSession {
  id: string;
  selectedGrade: number;
  selectedProblemTypes: string[];
  selectedTopicIds: string[];
  difficulty?: DifficultyMode;
  mode: PracticeMode;
  questionCount: number;
  requestedQuestionCount: number | 'ALL';
  availableQuestionCount: number;
  contentVersion: string;
  startedAt: string;
  currentQuestionIndex: number;
  correctCount: number;
  hintUsage: number;
  attempts: PracticeAttemptSummary[];
  mistakes: PracticeMistakeSummary[];
  completed: boolean;
  questions: StudentQuestion[];
}

export interface PracticeAttemptSummary {
  questionId: string;
  correct: boolean;
  hintCount: number;
  misconception?: MisconceptionCode;
  answeredAt: string;
}

export interface PracticeMistakeSummary {
  questionId: string;
  skillId: string;
  misconception: MisconceptionCode;
  occurredAt: string;
}

export interface SubmitPracticeAnswerRequest {
  questionId: string;
  answer: StudentAnswer;
  hintCount: number;
}

export interface SubmitPracticeAnswerResponse {
  result: AnswerResult;
  correctAnswerSummary?: string;
  currentQuestionIndex: number;
  correctCount: number;
  completed: boolean;
}
