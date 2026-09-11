import type { StudentQuestion } from '@math-app/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { localQuestionHistoryRepository } from './questionHistoryRepository';

function question(id: string, problemTypeId = 'digit-place-value'): StudentQuestion {
  return {
    id,
    contentVersion: 'grade4-v3',
    templateId: `${problemTypeId}-t1`,
    fingerprint: `fingerprint-${id}`,
    grade: 4,
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    skillId: `${problemTypeId}-skill`,
    problemTypeId,
    format: 'SHORT_ANSWER',
    difficulty: 'EASY',
    assessmentLevel: 'LEVEL_1',
    testEligible: true,
    scoreWeight: 1,
    stem: 'Câu hỏi',
    hints: [
      { level: 1, text: 'Gợi ý 1' },
      { level: 2, text: 'Gợi ý 2' },
      { level: 3, text: 'Gợi ý 3' },
    ],
    prerequisiteSkillIds: [],
    status: 'REVIEWED',
    version: 2,
  };
}

beforeEach(() => window.localStorage.clear());

describe('local question history', () => {
  it('stores only minimal question identity and filters by type', () => {
    localQuestionHistoryRepository.record(
      [question('q1'), question('q2', 'compare-numbers')],
      '2026-09-11T00:00:00.000Z',
    );
    expect(localQuestionHistoryRepository.getRecent(['digit-place-value'])).toEqual([
      {
        problemTypeId: 'digit-place-value',
        questionId: 'q1',
        fingerprint: 'fingerprint-q1',
        lastSeenAt: '2026-09-11T00:00:00.000Z',
      },
    ]);
    expect(window.localStorage.getItem('math-app-class4-question-history-v3')).not.toContain(
      'Câu hỏi',
    );
  });

  it('updates last-seen time without duplicating a question id', () => {
    localQuestionHistoryRepository.record([question('q1')], '2026-09-10T00:00:00.000Z');
    localQuestionHistoryRepository.record([question('q1')], '2026-09-11T00:00:00.000Z');
    expect(localQuestionHistoryRepository.getRecent(['digit-place-value'])).toHaveLength(1);
    expect(localQuestionHistoryRepository.getRecent(['digit-place-value'])[0]?.lastSeenAt).toBe(
      '2026-09-11T00:00:00.000Z',
    );
  });
});
