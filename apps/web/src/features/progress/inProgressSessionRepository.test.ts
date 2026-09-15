import { beforeEach, describe, expect, it, vi } from 'vitest';
import { historyFileRepository } from './historyFileRepository';
import { inProgressSessionRepository } from './inProgressSessionRepository';

beforeEach(() => {
  historyFileRepository.resetForTests();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Response(
          JSON.stringify({
            version: 1,
            updatedAt: new Date().toISOString(),
            records: historyFileRepository.getSnapshot().records,
            inProgress: historyFileRepository.getSnapshot().inProgress,
            completions: historyFileRepository.getSnapshot().completions,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    ),
  );
});

describe('file-backed in-progress session repository', () => {
  it('stores and removes resumable practice drafts in the shared file cache', () => {
    inProgressSessionRepository.save({
      id: 'practice-1',
      sessionType: 'PRACTICE',
      title: 'Ôn tập đang làm dở',
      startedAt: '2026-09-15T02:00:00.000Z',
      savedAt: '2026-09-15T02:05:00.000Z',
      resumePath: '/practice?resume=practice-1',
      currentIndex: 2,
      totalQuestions: 10,
      answeredCount: 2,
      practiceMode: 'REVIEW',
      selectedLeafTypeIds: ['number-pattern'],
      answers: { q1: '12' },
      hintLevels: { q1: 1 },
      results: [],
    });

    expect(inProgressSessionRepository.get('practice-1')).toMatchObject({
      sessionType: 'PRACTICE',
      answeredCount: 2,
      resumePath: '/practice?resume=practice-1',
    });

    inProgressSessionRepository.remove('practice-1');
    expect(inProgressSessionRepository.list()).toEqual([]);
  });
});
