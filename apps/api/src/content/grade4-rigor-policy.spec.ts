import { buildBankInMemory } from './generation/bank-builder';
import { FOUNDATION_PRACTICE_ONLY_PROBLEM_TYPES } from './generation/grade4-rigor-policy';
import { seededRandom } from './generation/content-math';
import { assembleTestQuestions } from '../test-mode/test-assembler';
import { testBlueprints } from '../test-mode/test-blueprints';

function allQuestions() {
  const bank = buildBankInMemory('2026-09-15T00:00:00.000Z');
  return [...bank.shards.values()].flat();
}

describe('Grade 4 rigor policy', () => {
  it('keeps foundational lower-grade refreshers out of periodic/test assembly', () => {
    const questions = allQuestions();

    for (const id of FOUNDATION_PRACTICE_ONLY_PROBLEM_TYPES) {
      const items = questions.filter((question) => question.problemTypeId === id);
      expect(items).toHaveLength(100);
      expect(items.every((question) => question.testEligible === false)).toBe(true);
    }
  });

  it('requires an actual protractor visual for angle-measure questions', () => {
    const questions = allQuestions().filter(
      (question) => question.problemTypeId === 'measure-angle-degrees',
    );

    expect(questions).toHaveLength(100);
    expect(
      questions.every(
        (question) =>
          question.visual?.type === 'ANGLE' &&
          question.visual.mode === 'MEASURE' &&
          question.visual.vertexLabel === 'O',
      ),
    ).toBe(true);
  });

  it('keeps classification angles visually distinct from measurement angles', () => {
    const questions = allQuestions().filter(
      (question) => question.problemTypeId === 'classify-angles',
    );

    expect(questions).toHaveLength(100);
    expect(
      questions.every(
        (question) => question.visual?.type === 'ANGLE' && question.visual.mode === 'CLASSIFY',
      ),
    ).toBe(true);
  });

  it('adds a time-line visual to every duration problem', () => {
    const questions = allQuestions().filter(
      (question) => question.problemTypeId === 'calculate-duration',
    );

    expect(questions).toHaveLength(100);
    expect(
      questions.every(
        (question) =>
          question.visual?.type === 'TIME_LINE' &&
          question.visual.durationMinutes > 0 &&
          question.visual.hideEnd === true,
      ),
    ).toBe(true);
  });

  it.each(testBlueprints)('$title contains no foundation-only refresher questions', (blueprint) => {
    const questions = allQuestions();

    for (let seed = 1; seed <= 3; seed += 1) {
      const assembled = assembleTestQuestions(
        blueprint,
        questions,
        seededRandom(`grade4-rigor-${blueprint.id}-${seed}`),
      );

      expect(assembled).toHaveLength(blueprint.questionCount);
      expect(
        assembled.some((question) =>
          FOUNDATION_PRACTICE_ONLY_PROBLEM_TYPES.has(question.problemTypeId),
        ),
      ).toBe(false);
    }
  });
});
