import type { Question, StudentAnswer } from '@math-app/shared';
import { ContentServiceV2 } from '../content/content-service.v2';
import { questionBank } from '../content/question-bank.v2.data';
import { seededRandom } from '../content/generation/content-math';
import { assembleTestQuestions } from './test-assembler';
import { validateTestBlueprint } from './test-blueprint-validator';
import { testBlueprints } from './test-blueprints';
import { TestModeService } from './test-mode.service';
import { scoreTestAttempt } from './test-scoring';

function correctAnswer(question: Question): StudentAnswer {
  const answer = question.expectedAnswer;
  switch (answer.kind) {
    case 'NUMBER':
      return String(answer.value);
    case 'FRACTION':
      return { kind: 'FRACTION', numerator: answer.numerator, denominator: answer.denominator };
    case 'TEXT':
      return answer.accepted[0] ?? '';
    case 'OPTION':
      return answer.optionId;
    case 'OPTIONS':
      return answer.optionIds;
    case 'BOOLEAN':
      return answer.value;
    case 'ORDER':
      return answer.itemIds;
    case 'MATCHES':
      return Object.fromEntries(answer.pairs.map((pair) => [pair.leftId, pair.rightId]));
  }
}

describe('Grade 4 test mode', () => {
  const blueprint = testBlueprints.find((item) => item.id === 'comprehensive')!;

  it('validates and assembles an exact frozen blueprint without duplicates', () => {
    expect(validateTestBlueprint(blueprint, questionBank)).toEqual([]);
    const selected = assembleTestQuestions(blueprint, questionBank, seededRandom('attempt-a'));
    expect(selected).toHaveLength(20);
    expect(new Set(selected.map((question) => question.id)).size).toBe(20);
    expect(new Set(selected.map((question) => question.fingerprint)).size).toBe(20);
    for (const [level, count] of Object.entries(blueprint.assessmentLevelDistribution))
      expect(selected.filter((question) => question.assessmentLevel === level)).toHaveLength(count);
    for (const [format, count] of Object.entries(blueprint.formatDistribution))
      expect(selected.filter((question) => question.format === format)).toHaveLength(count);
    for (const topicId of blueprint.topicCoverage)
      expect(selected.some((question) => question.topicId === topicId)).toBe(true);
  });

  it('scores deterministically on a ten-point integer scale and counts unanswered', () => {
    const selected = assembleTestQuestions(blueprint, questionBank, seededRandom('score')).slice(
      0,
      4,
    );
    const answers: Record<string, StudentAnswer> = {
      [selected[0]!.id]: correctAnswer(selected[0]!),
      [selected[1]!.id]: correctAnswer(selected[1]!),
      [selected[2]!.id]: '__wrong__',
    };
    const first = scoreTestAttempt(
      selected,
      answers,
      '2026-09-11T10:00:00.000Z',
      '2026-09-11T10:05:00.000Z',
    );
    const second = scoreTestAttempt(
      selected,
      answers,
      '2026-09-11T10:00:00.000Z',
      '2026-09-11T10:05:00.000Z',
    );
    expect(second).toEqual(first);
    expect(first.rawCorrect).toBe(2);
    expect(first.rawIncorrect).toBe(1);
    expect(first.rawUnanswered).toBe(1);
    expect(first.finalScore10).toBe(5);
    expect(
      first.topicBreakdown.every(
        (topic) => typeof topic.topicName === 'string' && topic.topicName !== topic.topicId,
      ),
    ).toBe(true);
  });

  it('keeps the question set stable, permits edits before submit, and locks after submit', () => {
    const service = new TestModeService(new ContentServiceV2());
    const attempt = service.create({ blueprintId: blueprint.id, randomSeed: 'fixed' });
    expect(attempt.questions.every((question) => !Object.hasOwn(question, 'hints'))).toBe(true);
    expect(attempt.questions.every((question) => !Object.hasOwn(question, 'assessmentLevel'))).toBe(
      true,
    );
    const ids = attempt.questions.map((question) => question.id);
    expect(service.get(attempt.id).questions.map((question) => question.id)).toEqual(ids);
    service.updateAnswer(attempt.id, ids[0]!, 'first');
    expect(service.updateAnswer(attempt.id, ids[0]!, 'changed').answers[ids[0]!]).toBe('changed');
    const submitted = service.submit(attempt.id, { answers: {} });
    expect(submitted.status).toBe('SUBMITTED');
    expect(submitted.result?.rawUnanswered).toBe(20);
    expect(() => service.updateAnswer(attempt.id, ids[0]!, 'late')).toThrow();
    expect(() => service.submit(attempt.id, { answers: {} })).toThrow();
  });

  it('normally changes sets and avoids recent IDs when enough alternatives exist', () => {
    const first = assembleTestQuestions(blueprint, questionBank, seededRandom('one'));
    const second = assembleTestQuestions(
      blueprint,
      questionBank,
      seededRandom('two'),
      first.map((question) => question.id),
    );
    expect(second.map((question) => question.id)).not.toEqual(first.map((question) => question.id));
    expect(second.some((question) => first.some((prior) => prior.id === question.id))).toBe(false);
  });
});
