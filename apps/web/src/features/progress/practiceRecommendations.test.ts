import type { CurriculumCatalog, ProgressSummary } from '@math-app/shared';
import { describe, expect, it } from 'vitest';
import {
  buildContinueProblemType,
  buildDailyProblemTypeIds,
  buildWeakSkillRecommendations,
} from './practiceRecommendations';

const catalog = {
  problemTypes: [
    {
      id: 'multiply-one-digit',
      domainId: 'number-and-operations',
      topicId: 'multiplication',
      skillId: 'multiply-one-digit-skill',
      name: 'Nhân với số có một chữ số',
      description: 'Nhân theo từng hàng.',
      questionCount: 5,
      visualQuestionCount: 0,
      supportedDifficulties: ['EASY', 'MEDIUM', 'HARD'],
    },
    {
      id: 'length-conversion',
      domainId: 'measurement',
      topicId: 'units',
      skillId: 'length-conversion-skill',
      name: 'Đổi đơn vị độ dài',
      description: 'Đổi m và cm.',
      questionCount: 5,
      visualQuestionCount: 1,
      supportedDifficulties: ['EASY', 'MEDIUM', 'HARD'],
    },
    {
      id: 'identify-fraction',
      domainId: 'fractions',
      topicId: 'grade-4-fractions',
      skillId: 'identify-fraction-skill',
      name: 'Nhận biết phân số',
      description: 'Đọc phần đã tô.',
      questionCount: 5,
      visualQuestionCount: 5,
      supportedDifficulties: ['EASY', 'MEDIUM', 'HARD'],
    },
  ],
} as CurriculumCatalog;

function progress(skills: ProgressSummary['skills']): ProgressSummary {
  return { totalQuestions: 4, independentCorrect: 1, hintedCorrect: 1, skills };
}

describe('practice recommendations', () => {
  it('puts the weakest known skill first and ignores unknown skill IDs', () => {
    const summary = progress([
      {
        skillId: 'unknown-skill',
        attempts: 4,
        correct: 0,
        incorrect: 4,
        independentCorrect: 0,
        hintedCorrect: 0,
        lastPracticedAt: '2026-09-11T08:00:00.000Z',
        recentMistakes: ['PROCEDURE_ERROR'],
        masteryLevel: 'NEEDS_REVIEW',
      },
      {
        skillId: 'length-conversion-skill',
        attempts: 4,
        correct: 1,
        incorrect: 3,
        independentCorrect: 0,
        hintedCorrect: 1,
        lastPracticedAt: '2026-09-11T09:00:00.000Z',
        recentMistakes: ['UNIT_CONVERSION_ERROR'],
        masteryLevel: 'NEEDS_REVIEW',
      },
    ]);

    expect(buildWeakSkillRecommendations(summary, catalog).map((item) => item.id)).toEqual([
      'length-conversion',
    ]);
    expect(buildDailyProblemTypeIds(summary, catalog)[0]).toBe('length-conversion');
  });

  it('uses a deterministic deduplicated fallback when progress is empty', () => {
    const empty = progress([]);
    const first = buildDailyProblemTypeIds(empty, catalog);
    const second = buildDailyProblemTypeIds(empty, catalog);
    expect(second).toEqual(first);
    expect(new Set(first).size).toBe(first.length);
    expect(first).toEqual(['multiply-one-digit', 'length-conversion', 'identify-fraction']);
  });

  it('continues the most recently practiced known skill', () => {
    const summary = progress([
      {
        skillId: 'multiply-one-digit-skill',
        attempts: 2,
        correct: 2,
        incorrect: 0,
        independentCorrect: 2,
        hintedCorrect: 0,
        lastPracticedAt: '2026-09-10T09:00:00.000Z',
        recentMistakes: [],
        masteryLevel: 'LEARNING',
      },
      {
        skillId: 'identify-fraction-skill',
        attempts: 1,
        correct: 1,
        incorrect: 0,
        independentCorrect: 1,
        hintedCorrect: 0,
        lastPracticedAt: '2026-09-11T09:00:00.000Z',
        recentMistakes: [],
        masteryLevel: 'LEARNING',
      },
    ]);
    expect(buildContinueProblemType(summary, catalog)?.id).toBe('identify-fraction');
    expect(buildContinueProblemType(progress([]), catalog)?.id).toBe('multiply-one-digit');
  });
});
