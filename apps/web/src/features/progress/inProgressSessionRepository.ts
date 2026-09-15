import type { PracticeMode, StoredQuestionResult, StudentAnswer } from '@math-app/shared';

export const inProgressSessionStorageKey = 'math-app-class4-in-progress-v1';

interface DraftBase {
  id: string;
  title: string;
  startedAt: string;
  savedAt: string;
  resumePath: string;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

export interface PracticeSessionDraft extends DraftBase {
  sessionType: 'PRACTICE';
  practiceMode: PracticeMode;
  selectedLeafTypeIds: string[];
  answers: Record<string, StudentAnswer>;
  hintLevels: Record<string, number>;
  results: StoredQuestionResult[];
}

export interface TestSessionDraft extends DraftBase {
  sessionType: 'TEST';
  testBlueprintId: string;
  answers: Record<string, StudentAnswer>;
}

export type InProgressSessionDraft = PracticeSessionDraft | TestSessionDraft;

function isDraft(value: unknown): value is InProgressSessionDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<InProgressSessionDraft>;
  return (
    typeof draft.id === 'string' &&
    (draft.sessionType === 'PRACTICE' || draft.sessionType === 'TEST') &&
    typeof draft.title === 'string' &&
    typeof draft.startedAt === 'string' &&
    typeof draft.savedAt === 'string' &&
    typeof draft.resumePath === 'string' &&
    typeof draft.currentIndex === 'number' &&
    typeof draft.totalQuestions === 'number' &&
    typeof draft.answeredCount === 'number' &&
    Boolean(draft.answers) &&
    typeof draft.answers === 'object'
  );
}

function read(): InProgressSessionDraft[] {
  try {
    const raw = window.localStorage.getItem(inProgressSessionStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isDraft)
      .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
      .slice(0, 50);
  } catch {
    return [];
  }
}

function write(records: readonly InProgressSessionDraft[]): void {
  window.localStorage.setItem(inProgressSessionStorageKey, JSON.stringify(records.slice(0, 50)));
}

export const inProgressSessionRepository = {
  list(sessionType?: InProgressSessionDraft['sessionType']): InProgressSessionDraft[] {
    const records = read();
    return sessionType ? records.filter((record) => record.sessionType === sessionType) : records;
  },

  get(id: string): InProgressSessionDraft | undefined {
    return read().find((record) => record.id === id);
  },

  save(record: InProgressSessionDraft): void {
    const current = read();
    write([
      record,
      ...current.filter(
        (item) => !(item.id === record.id && item.sessionType === record.sessionType),
      ),
    ]);
  },

  remove(id: string): void {
    write(read().filter((record) => record.id !== id));
  },

  clear(): void {
    window.localStorage.removeItem(inProgressSessionStorageKey);
  },
};
