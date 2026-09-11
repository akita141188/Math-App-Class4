import { beforeEach, describe, expect, it } from 'vitest';
import { localProgressRepository } from './progressRepository';

beforeEach(() => window.localStorage.clear());

describe('localProgressRepository', () => {
  it('separates independent and hinted success and keeps child-safe mistake metadata', () => {
    localProgressRepository.recordAttempt(
      'length-conversion-skill',
      {
        correct: false,
        feedback: 'Đổi về cùng đơn vị.',
        misconception: 'UNIT_CONVERSION_ERROR',
      },
      1,
    );
    localProgressRepository.recordAttempt(
      'length-conversion-skill',
      { correct: true, feedback: 'Chính xác.' },
      1,
    );
    localProgressRepository.recordAttempt(
      'multiply-one-digit-skill',
      { correct: true, feedback: 'Chính xác.' },
      0,
    );

    const summary = localProgressRepository.getSummary();
    expect(summary).toMatchObject({
      totalQuestions: 3,
      independentCorrect: 1,
      hintedCorrect: 1,
    });
    expect(summary.skills.find((item) => item.skillId === 'length-conversion-skill')).toMatchObject(
      {
        attempts: 2,
        correct: 1,
        incorrect: 1,
        recentMistakes: ['UNIT_CONVERSION_ERROR'],
      },
    );
    expect(window.localStorage.getItem('math-app-class4-progress-v1')).not.toContain('Đổi về');
  });
});
