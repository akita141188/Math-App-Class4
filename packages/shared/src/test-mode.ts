import type { AssessmentLevel, QuestionFormat, StudentAnswer, StudentQuestion } from './question';

/** A test payload deliberately excludes coaching and internal level metadata. */
export type TestQuestion = Omit<StudentQuestion, 'hints' | 'assessmentLevel'>;

export type TestKind = 'MID_TERM_1' | 'END_TERM_1' | 'MID_TERM_2' | 'END_YEAR' | 'COMPREHENSIVE';

export interface TestSectionBlueprint {
  id: string;
  title: string;
  questionCount: number;
  scoreWeight: number;
  topicIds: string[];
  formats: QuestionFormat[];
  assessmentLevels: AssessmentLevel[];
}

export interface TestBlueprint {
  id: string;
  title: string;
  kind: TestKind;
  grade: 4;
  description: string;
  durationMinutes?: number;
  totalScore: 10;
  questionCount: number;
  sections: TestSectionBlueprint[];
  topicCoverage: string[];
  assessmentLevelDistribution: Record<AssessmentLevel, number>;
  formatDistribution: Partial<Record<QuestionFormat, number>>;
}

export type TestAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED';

export interface TestAttempt {
  id: string;
  blueprintId: string;
  title: string;
  status: TestAttemptStatus;
  contentVersion: string;
  startedAt: string;
  submittedAt?: string;
  questions: TestQuestion[];
  answers: Record<string, StudentAnswer>;
  result?: TestResult;
}

export interface TestQuestionResult {
  questionId: string;
  topicId: string;
  problemTypeId: string;
  assessmentLevel: AssessmentLevel;
  correct: boolean;
  unanswered: boolean;
  pointsEarned: number;
  pointsPossible: number;
  studentAnswer?: StudentAnswer;
  correctAnswerSummary: string;
  explanation: string;
}

export interface TestResult {
  rawCorrect: number;
  rawIncorrect: number;
  rawUnanswered: number;
  rawPoints: number;
  possiblePoints: number;
  rawPercent: number;
  finalScore10: number;
  durationSeconds: number;
  topicBreakdown: Array<{
    topicId: string;
    topicName?: string;
    correctCount: number;
    questionCount: number;
  }>;
  questionResults: TestQuestionResult[];
}

export interface CreateTestAttemptRequest {
  blueprintId: string;
  recentQuestionIds?: string[];
  randomSeed?: string;
}

export interface UpdateTestAnswerRequest {
  questionId: string;
  answer: StudentAnswer;
}

export interface SubmitTestAttemptRequest {
  answers: Record<string, StudentAnswer>;
}
