import type { DifficultyMode, PracticeMode } from './practice';
import type { AssessmentLevel, QuestionFormat, StudentAnswer } from './question';

export const HISTORY_STORAGE_VERSION = 3 as const;
export const HISTORY_RETENTION_LIMIT = 200 as const;

export interface StoredQuestionResult {
  questionId: string;
  leafTypeId: string;
  topicId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  assessmentLevel?: AssessmentLevel;
  format: QuestionFormat;
  correct: boolean;
  unanswered: boolean;
  hintCount: number;
  answeredAt?: string;
  studentAnswer?: StudentAnswer;
  correctAnswerSummary?: string;
  questionSummary: string;
  explanation?: string;
}

export interface PracticeHistoryRecord {
  id: string;
  sessionType: 'PRACTICE';
  practiceMode: PracticeMode;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  contentVersion: string;
  selectedDomainIds: string[];
  selectedTopicIds: string[];
  selectedLeafTypeIds: string[];
  difficultyMode: DifficultyMode;
  requestedQuestionCount: number | 'ALL';
  actualQuestionCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracyPercent: number;
  questionResults: StoredQuestionResult[];
}

export interface TestHistoryRecord {
  id: string;
  sessionType: 'TEST';
  testBlueprintId: string;
  testTitle: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  contentVersion: string;
  questionCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  rawPercent: number;
  finalScore10: number;
  topicBreakdown: Array<{
    topicId: string;
    topicName?: string;
    correctCount: number;
    questionCount: number;
  }>;
  questionResults: StoredQuestionResult[];
}

export type LearningHistoryRecord = PracticeHistoryRecord | TestHistoryRecord;

export interface LearningHistoryStore {
  version: typeof HISTORY_STORAGE_VERSION;
  records: LearningHistoryRecord[];
  completions: LeafCompletionRecord[];
}

export type CompletionStatus = 'NOT_STARTED' | 'PRACTICING' | 'COMPLETED' | 'NEEDS_REVIEW';

export interface LeafCompletionRecord {
  leafTypeId: string;
  status: CompletionStatus;
  attemptedQuestions: number;
  recentIndependentAccuracy: number;
  completedAt?: string;
  lastPracticedAt?: string;
}
