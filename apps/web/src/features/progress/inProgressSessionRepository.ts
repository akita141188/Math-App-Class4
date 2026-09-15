import type {
  InProgressSessionDraft,
  PracticeSessionDraft,
  TestSessionDraft,
} from '@math-app/shared';
import { historyFileRepository } from './historyFileRepository';

export type { InProgressSessionDraft, PracticeSessionDraft, TestSessionDraft };

export const inProgressSessionStorageKey = 'math-app-class4-in-progress-v1';

export const inProgressSessionRepository = {
  list(sessionType?: InProgressSessionDraft['sessionType']): InProgressSessionDraft[] {
    const records = historyFileRepository.getSnapshot().inProgress;
    return sessionType ? records.filter((record) => record.sessionType === sessionType) : records;
  },

  get(id: string): InProgressSessionDraft | undefined {
    return historyFileRepository.getSnapshot().inProgress.find((record) => record.id === id);
  },

  save(record: InProgressSessionDraft): void {
    historyFileRepository.optimisticSaveDraft(record);
  },

  remove(id: string): void {
    historyFileRepository.optimisticDeleteDraft(id);
  },

  clear(): void {
    for (const draft of historyFileRepository.getSnapshot().inProgress) {
      historyFileRepository.optimisticDeleteDraft(draft.id);
    }
  },
};
