import type {
  LeafCompletionRecord,
  LearningHistoryRecord,
  LearningHistoryStore,
  PracticeHistoryRecord,
} from '@math-app/shared';
import { HISTORY_RETENTION_LIMIT, HISTORY_STORAGE_VERSION } from '@math-app/shared';

export const learningHistoryStorageKey = 'math-app-class4-learning-history-v3';

function emptyStore(): LearningHistoryStore {
  return { version: HISTORY_STORAGE_VERSION, records: [], completions: [] };
}

function timestamp(record: LearningHistoryRecord): string {
  return record.sessionType === 'PRACTICE' ? record.completedAt : record.submittedAt;
}

function isHistoryRecord(value: unknown): value is LearningHistoryRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<LearningHistoryRecord>;
  return (
    typeof record.id === 'string' &&
    (record.sessionType === 'PRACTICE' || record.sessionType === 'TEST') &&
    typeof record.contentVersion === 'string' &&
    Array.isArray(record.questionResults)
  );
}

function read(): LearningHistoryStore {
  try {
    const raw = window.localStorage.getItem(learningHistoryStorageKey);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<LearningHistoryStore>;
    if (parsed.version !== HISTORY_STORAGE_VERSION || !Array.isArray(parsed.records))
      return emptyStore();
    return {
      version: HISTORY_STORAGE_VERSION,
      records: parsed.records
        .filter(isHistoryRecord)
        .sort((a, b) => timestamp(b).localeCompare(timestamp(a)))
        .slice(0, HISTORY_RETENTION_LIMIT),
      completions: Array.isArray(parsed.completions)
        ? parsed.completions.filter(
            (item): item is LeafCompletionRecord =>
              Boolean(item) && typeof item.leafTypeId === 'string',
          )
        : [],
    };
  } catch {
    return emptyStore();
  }
}

function completionFor(
  leafTypeId: string,
  records: readonly PracticeHistoryRecord[],
  prior?: LeafCompletionRecord,
): LeafCompletionRecord {
  const sessions = records.filter((record) => record.selectedLeafTypeIds.includes(leafTypeId));
  const results = sessions.flatMap((record) =>
    record.questionResults.filter((result) => result.leafTypeId === leafTypeId),
  );
  const independent = results.filter((result) => result.hintCount === 0 && !result.unanswered);
  const recent = independent.slice(0, 20);
  const accuracy =
    recent.length === 0 ? 0 : recent.filter((result) => result.correct).length / recent.length;
  const attemptedQuestions = new Set(results.map((result) => result.questionId)).size;
  const qualifies =
    sessions.length >= 2 && attemptedQuestions >= 20 && recent.length >= 15 && accuracy >= 0.8;
  const completedAt = prior?.completedAt ?? (qualifies ? sessions[0]?.completedAt : undefined);
  const status: LeafCompletionRecord['status'] =
    results.length === 0
      ? 'NOT_STARTED'
      : completedAt && recent.length >= 10 && accuracy < 0.6
        ? 'NEEDS_REVIEW'
        : qualifies || completedAt
          ? 'COMPLETED'
          : 'PRACTICING';
  return {
    leafTypeId,
    status,
    attemptedQuestions,
    recentIndependentAccuracy: Math.round(accuracy * 100),
    completedAt,
    lastPracticedAt: sessions[0]?.completedAt,
  };
}

function recomputeCompletions(store: LearningHistoryStore): LeafCompletionRecord[] {
  const practices = store.records.filter(
    (record): record is PracticeHistoryRecord => record.sessionType === 'PRACTICE',
  );
  const leafIds = new Set([
    ...store.completions.map((item) => item.leafTypeId),
    ...practices.flatMap((record) => record.selectedLeafTypeIds),
  ]);
  return [...leafIds].map((leafTypeId) =>
    completionFor(
      leafTypeId,
      practices,
      store.completions.find((item) => item.leafTypeId === leafTypeId),
    ),
  );
}

export const localLearningHistoryRepository = {
  getStore: read,

  list(sessionType?: LearningHistoryRecord['sessionType']): LearningHistoryRecord[] {
    const records = read().records;
    return sessionType ? records.filter((record) => record.sessionType === sessionType) : records;
  },

  get(id: string): LearningHistoryRecord | undefined {
    return read().records.find((record) => record.id === id);
  },

  save(record: LearningHistoryRecord): LearningHistoryStore {
    const current = read();
    const next: LearningHistoryStore = {
      version: HISTORY_STORAGE_VERSION,
      records: [record, ...current.records.filter((item) => item.id !== record.id)]
        .sort((a, b) => timestamp(b).localeCompare(timestamp(a)))
        .slice(0, HISTORY_RETENTION_LIMIT),
      completions: current.completions,
    };
    next.completions = recomputeCompletions(next);
    window.localStorage.setItem(learningHistoryStorageKey, JSON.stringify(next));
    return next;
  },

  getCompletion(leafTypeId: string): LeafCompletionRecord {
    const store = read();
    return (
      store.completions.find((item) => item.leafTypeId === leafTypeId) ??
      completionFor(leafTypeId, [], undefined)
    );
  },

  clear(): void {
    window.localStorage.removeItem(learningHistoryStorageKey);
  },
};
