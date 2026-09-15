import type {
  LeafCompletionRecord,
  LearningHistoryRecord,
  LearningHistoryStore,
  PracticeHistoryRecord,
} from '@math-app/shared';
import { HISTORY_STORAGE_VERSION } from '@math-app/shared';
import { historyFileRepository } from './historyFileRepository';

function read(): LearningHistoryStore {
  const file = historyFileRepository.getSnapshot();
  return {
    version: HISTORY_STORAGE_VERSION,
    records: file.records,
    completions: file.completions,
  };
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

function recomputeCompletions(
  records: readonly LearningHistoryRecord[],
  priorCompletions: readonly LeafCompletionRecord[] = [],
): LeafCompletionRecord[] {
  const practices = records.filter(
    (record): record is PracticeHistoryRecord => record.sessionType === 'PRACTICE',
  );
  const leafIds = new Set([
    ...priorCompletions.map((item) => item.leafTypeId),
    ...practices.flatMap((record) => record.selectedLeafTypeIds),
  ]);
  return [...leafIds].map((leafTypeId) =>
    completionFor(
      leafTypeId,
      practices,
      priorCompletions.find((item) => item.leafTypeId === leafTypeId),
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
    const records = [record, ...read().records.filter((item) => item.id !== record.id)];
    const completions = recomputeCompletions(records, read().completions);
    historyFileRepository.optimisticSaveRecord(record, completions);
    return read();
  },

  delete(id: string): LearningHistoryStore {
    const records = read().records.filter((record) => record.id !== id);
    const completions = recomputeCompletions(records);
    historyFileRepository.optimisticDeleteRecord(id, completions);
    return read();
  },

  getCompletion(leafTypeId: string): LeafCompletionRecord {
    const store = read();
    return (
      store.completions.find((item) => item.leafTypeId === leafTypeId) ??
      completionFor(leafTypeId, [])
    );
  },

  clear(): void {
    for (const record of read().records) {
      const remaining = read().records.filter((item) => item.id !== record.id);
      historyFileRepository.optimisticDeleteRecord(record.id, recomputeCompletions(remaining));
    }
  },
};
