import type { RecentQuestionReference, StudentQuestion } from '@math-app/shared';

const storageKey = 'math-app-class4-question-history-v3';
const maxEntriesPerType = 100;

export interface QuestionHistoryRepository {
  getRecent(problemTypeIds: readonly string[]): RecentQuestionReference[];
  record(questions: readonly StudentQuestion[], seenAt?: string): void;
  clear(): void;
}

function readHistory(): RecentQuestionReference[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is RecentQuestionReference =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as RecentQuestionReference).problemTypeId === 'string' &&
        typeof (item as RecentQuestionReference).questionId === 'string' &&
        typeof (item as RecentQuestionReference).fingerprint === 'string' &&
        typeof (item as RecentQuestionReference).lastSeenAt === 'string',
    );
  } catch {
    return [];
  }
}

export const localQuestionHistoryRepository: QuestionHistoryRepository = {
  getRecent(problemTypeIds) {
    const selected = new Set(problemTypeIds);
    return readHistory().filter((item) => selected.has(item.problemTypeId));
  },
  record(questions, seenAt = new Date().toISOString()) {
    const incomingIds = new Set(questions.map((question) => question.id));
    const merged = [
      ...readHistory().filter((item) => !incomingIds.has(item.questionId)),
      ...questions.map((question) => ({
        problemTypeId: question.problemTypeId,
        questionId: question.id,
        fingerprint: question.fingerprint,
        lastSeenAt: seenAt,
      })),
    ];
    const byType = new Map<string, RecentQuestionReference[]>();
    for (const item of merged) {
      const items = byType.get(item.problemTypeId) ?? [];
      items.push(item);
      byType.set(item.problemTypeId, items);
    }
    const bounded = [...byType.values()].flatMap((items) =>
      items.sort((a, b) => a.lastSeenAt.localeCompare(b.lastSeenAt)).slice(-maxEntriesPerType),
    );
    window.localStorage.setItem(storageKey, JSON.stringify(bounded));
  },
  clear() {
    window.localStorage.removeItem(storageKey);
  },
};
