import type {
  LearningHistoryRecord,
  LearningHistoryStore,
  LeafCompletionRecord,
  StoredQuestionResult,
} from './history';
import type { PracticeMode } from './practice';
import type { AssessmentLevel, QuestionFormat, StudentAnswer } from './question';

export const HISTORY_FILE_VERSION = 1 as const;
export const HISTORY_FILE_RELATIVE_PATH = 'data/history/history.json' as const;
export const HISTORY_FILE_DRAFT_LIMIT = 50 as const;

export type HistoryDraftQuestionState = 'CORRECT' | 'WRONG' | 'ANSWERED' | 'WORKING' | 'UNANSWERED';

export interface HistoryDraftQuestionSnapshot {
  questionId: string;
  questionSummary: string;
  leafTypeId: string;
  topicId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  assessmentLevel?: AssessmentLevel;
  format: QuestionFormat;
}

interface HistoryDraftBase {
  id: string;
  title: string;
  startedAt: string;
  savedAt: string;
  resumePath: string;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;

  /**
   * Added in V12. Optional so history.json files created by V11 remain readable.
   * The snapshot lets History render an in-progress session without depending on
   * the live in-memory API session.
   */
  questions?: HistoryDraftQuestionSnapshot[];
  questionStates?: Record<string, HistoryDraftQuestionState>;
}

export interface PracticeSessionDraft extends HistoryDraftBase {
  sessionType: 'PRACTICE';
  practiceMode: PracticeMode;
  selectedLeafTypeIds: string[];
  answers: Record<string, StudentAnswer>;
  hintLevels: Record<string, number>;
  results: StoredQuestionResult[];
}

export interface TestSessionDraft extends HistoryDraftBase {
  sessionType: 'TEST';
  testBlueprintId: string;
  answers: Record<string, StudentAnswer>;
}

export type InProgressSessionDraft = PracticeSessionDraft | TestSessionDraft;

export interface HistoryFileStore {
  version: typeof HISTORY_FILE_VERSION;
  updatedAt: string;
  records: LearningHistoryRecord[];
  inProgress: InProgressSessionDraft[];
  completions: LeafCompletionRecord[];
}

export interface HistoryLocalImportRequest {
  historyStore?: LearningHistoryStore;
  inProgress?: InProgressSessionDraft[];
}
