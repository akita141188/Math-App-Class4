import { beforeEach, describe, expect, it } from 'vitest';
import {
  inProgressSessionRepository,
  inProgressSessionStorageKey,
} from './inProgressSessionRepository';

beforeEach(() => window.localStorage.clear());

describe('in-progress session repository', () => {
  it('stores and removes resumable practice drafts', () => {
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
    expect(window.localStorage.getItem(inProgressSessionStorageKey)).toBe('[]');
  });
});
