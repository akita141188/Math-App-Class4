import type {
  HistoryDraftQuestionSnapshot,
  HistoryDraftQuestionState,
  StudentAnswer,
} from '@math-app/shared';

interface DraftQuestionSource {
  id: string;
  stem: string;
  problemTypeId: string;
  topicId: string;
  difficulty: HistoryDraftQuestionSnapshot['difficulty'];
  assessmentLevel?: HistoryDraftQuestionSnapshot['assessmentLevel'];
  format: HistoryDraftQuestionSnapshot['format'];
}

export interface DraftStateCounts {
  correct: number;
  wrong: number;
  answered: number;
  working: number;
  unanswered: number;
}

export function hasStoredAnswer(value: StudentAnswer | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return true;

  if ('kind' in value && value.kind === 'FRACTION') {
    return (
      typeof value.numerator === 'number' &&
      value.numerator >= 0 &&
      typeof value.denominator === 'number' &&
      value.denominator > 0
    );
  }

  return Object.values(value as Record<string, string>).some((item) => item.trim().length > 0);
}

export function snapshotDraftQuestions(
  questions: readonly DraftQuestionSource[],
): HistoryDraftQuestionSnapshot[] {
  return questions.map((question) => ({
    questionId: question.id,
    questionSummary: question.stem,
    leafTypeId: question.problemTypeId,
    topicId: question.topicId,
    difficulty: question.difficulty,
    assessmentLevel: question.assessmentLevel,
    format: question.format,
  }));
}

export function buildPracticeQuestionStates(
  questions: readonly Pick<DraftQuestionSource, 'id'>[],
  currentIndex: number,
  answers: Readonly<Record<string, StudentAnswer>>,
  solvedQuestionIds: ReadonlySet<string>,
  attemptedQuestionIds: ReadonlySet<string>,
): Record<string, HistoryDraftQuestionState> {
  const currentQuestionId = questions[currentIndex]?.id;

  return Object.fromEntries(
    questions.map((question) => {
      let state: HistoryDraftQuestionState = 'UNANSWERED';

      if (solvedQuestionIds.has(question.id)) state = 'CORRECT';
      else if (attemptedQuestionIds.has(question.id)) state = 'WRONG';
      else if (question.id === currentQuestionId || hasStoredAnswer(answers[question.id]))
        state = 'WORKING';

      return [question.id, state];
    }),
  );
}

export function buildTestQuestionStates(
  questions: readonly Pick<DraftQuestionSource, 'id'>[],
  currentIndex: number,
  answers: Readonly<Record<string, StudentAnswer>>,
): Record<string, HistoryDraftQuestionState> {
  const currentQuestionId = questions[currentIndex]?.id;

  return Object.fromEntries(
    questions.map((question) => {
      let state: HistoryDraftQuestionState = 'UNANSWERED';

      if (question.id === currentQuestionId) state = 'WORKING';
      else if (hasStoredAnswer(answers[question.id])) state = 'ANSWERED';

      return [question.id, state];
    }),
  );
}

export function countDraftQuestionStates(
  states: Readonly<Record<string, HistoryDraftQuestionState>> | undefined,
): DraftStateCounts {
  const counts: DraftStateCounts = {
    correct: 0,
    wrong: 0,
    answered: 0,
    working: 0,
    unanswered: 0,
  };

  for (const state of Object.values(states ?? {})) {
    if (state === 'CORRECT') counts.correct += 1;
    else if (state === 'WRONG') counts.wrong += 1;
    else if (state === 'ANSWERED') counts.answered += 1;
    else if (state === 'WORKING') counts.working += 1;
    else counts.unanswered += 1;
  }

  return counts;
}
