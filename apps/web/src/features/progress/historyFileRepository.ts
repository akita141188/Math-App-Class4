import type {
  HistoryFileStore,
  HistoryLocalImportRequest,
  InProgressSessionDraft,
  LearningHistoryRecord,
  LeafCompletionRecord,
} from '@math-app/shared';
import {
  HISTORY_FILE_VERSION,
  HISTORY_RETENTION_LIMIT,
  HISTORY_FILE_DRAFT_LIMIT,
} from '@math-app/shared';
import { useSyncExternalStore } from 'react';
import {
  clearHistoryFile,
  deleteHistoryDraft,
  deleteHistoryRecord,
  getHistoryFileStore,
  importLocalHistory,
  saveHistoryDraft,
  saveHistoryRecord,
} from '../../api/client';

export const legacyLearningHistoryStorageKey = 'math-app-class4-learning-history-v3';
export const legacyInProgressStorageKey = 'math-app-class4-in-progress-v1';

function emptyStore(): HistoryFileStore {
  return {
    version: HISTORY_FILE_VERSION,
    updatedAt: '',
    records: [],
    inProgress: [],
    completions: [],
  };
}

function timestamp(record: LearningHistoryRecord): string {
  return record.sessionType === 'PRACTICE' ? record.completedAt : record.submittedAt;
}

let snapshot = emptyStore();
let bootstrapPromise: Promise<void> | null = null;
let mutationQueue: Promise<void> = Promise.resolve();
let mutationVersion = 0;
const listeners = new Set<() => void>();

function emit(next: HistoryFileStore): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function normalize(value: HistoryFileStore): HistoryFileStore {
  return {
    version: HISTORY_FILE_VERSION,
    updatedAt: value.updatedAt ?? '',
    records: Array.isArray(value.records)
      ? [...value.records]
          .sort((left, right) => timestamp(right).localeCompare(timestamp(left)))
          .slice(0, HISTORY_RETENTION_LIMIT)
      : [],
    inProgress: Array.isArray(value.inProgress)
      ? [...value.inProgress]
          .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
          .slice(0, HISTORY_FILE_DRAFT_LIMIT)
      : [],
    completions: Array.isArray(value.completions) ? value.completions : [],
  };
}

function parseLocalJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : undefined;
  } catch {
    return undefined;
  }
}

function queueMutation(operation: () => Promise<HistoryFileStore>): void {
  const version = ++mutationVersion;
  mutationQueue = mutationQueue.then(async () => {
    try {
      const persisted = normalize(await operation());
      if (version === mutationVersion) emit(persisted);
    } catch (error) {
      console.error('Không thể ghi tệp lịch sử.', error);
    }
  });
}

export const historyFileRepository = {
  getSnapshot(): HistoryFileStore {
    return snapshot;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  bootstrap(): Promise<void> {
    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
      try {
        let store = normalize(await getHistoryFileStore());
        const legacyHistory = parseLocalJson(legacyLearningHistoryStorageKey);
        const legacyDrafts = parseLocalJson(legacyInProgressStorageKey);

        const hasLegacyHistory =
          Boolean(legacyHistory) &&
          typeof legacyHistory === 'object' &&
          Array.isArray((legacyHistory as { records?: unknown }).records);
        const hasLegacyDrafts = Array.isArray(legacyDrafts);

        if (hasLegacyHistory || hasLegacyDrafts) {
          const request: HistoryLocalImportRequest = {
            historyStore: hasLegacyHistory
              ? (legacyHistory as HistoryLocalImportRequest['historyStore'])
              : undefined,
            inProgress: hasLegacyDrafts ? (legacyDrafts as InProgressSessionDraft[]) : undefined,
          };
          store = normalize(await importLocalHistory(request));
          window.localStorage.removeItem(legacyLearningHistoryStorageKey);
          window.localStorage.removeItem(legacyInProgressStorageKey);
        }

        emit(store);
      } catch (error) {
        console.error('Không thể tải tệp lịch sử.', error);
      }
    })();

    return bootstrapPromise;
  },

  optimisticSaveRecord(
    record: LearningHistoryRecord,
    completions: readonly LeafCompletionRecord[],
  ): void {
    emit({
      ...snapshot,
      updatedAt: new Date().toISOString(),
      records: [record, ...snapshot.records.filter((item) => item.id !== record.id)]
        .sort((left, right) => timestamp(right).localeCompare(timestamp(left)))
        .slice(0, HISTORY_RETENTION_LIMIT),
      completions: [...completions],
    });
    queueMutation(() => saveHistoryRecord(record));
  },

  optimisticDeleteRecord(id: string, completions: readonly LeafCompletionRecord[]): void {
    emit({
      ...snapshot,
      updatedAt: new Date().toISOString(),
      records: snapshot.records.filter((record) => record.id !== id),
      completions: [...completions],
    });
    queueMutation(() => deleteHistoryRecord(id));
  },

  optimisticSaveDraft(draft: InProgressSessionDraft): void {
    emit({
      ...snapshot,
      updatedAt: new Date().toISOString(),
      inProgress: [
        draft,
        ...snapshot.inProgress.filter(
          (item) => !(item.id === draft.id && item.sessionType === draft.sessionType),
        ),
      ]
        .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
        .slice(0, HISTORY_FILE_DRAFT_LIMIT),
    });
    queueMutation(() => saveHistoryDraft(draft));
  },

  optimisticDeleteDraft(id: string): void {
    emit({
      ...snapshot,
      updatedAt: new Date().toISOString(),
      inProgress: snapshot.inProgress.filter((draft) => draft.id !== id),
    });
    queueMutation(() => deleteHistoryDraft(id));
  },

  clearAll(): void {
    emit({
      ...emptyStore(),
      updatedAt: new Date().toISOString(),
    });
    queueMutation(clearHistoryFile);
  },

  resetForTests(): void {
    snapshot = emptyStore();
    bootstrapPromise = null;
    mutationQueue = Promise.resolve();
    mutationVersion = 0;
    listeners.forEach((listener) => listener());
  },
};

export function useHistoryFileStore(): HistoryFileStore {
  return useSyncExternalStore(
    (listener) => historyFileRepository.subscribe(listener),
    () => historyFileRepository.getSnapshot(),
    () => historyFileRepository.getSnapshot(),
  );
}
