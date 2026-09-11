import type { RecentQuestionReference } from '@math-app/shared';
import { finalizedProblemBlueprints } from '../content/catalog.v2.data';
import { buildBankInMemory } from '../content/generation/bank-builder';
import { seededRandom } from '../content/generation/content-math';
import { selectPracticeQuestions } from './practice-selector';

describe('practice selection', () => {
  const bank = buildBankInMemory('test');
  const oneType = bank.shards.get(finalizedProblemBlueprints[0]!.id)!;

  it('is reproducible with the same seed and differs with another seed', () => {
    const first = selectPracticeQuestions({
      questions: oneType,
      questionCount: 10,
      rng: seededRandom('same'),
    });
    const second = selectPracticeQuestions({
      questions: oneType,
      questionCount: 10,
      rng: seededRandom('same'),
    });
    const different = selectPracticeQuestions({
      questions: oneType,
      questionCount: 10,
      rng: seededRandom('different'),
    });
    expect(second.map((q) => q.id)).toEqual(first.map((q) => q.id));
    expect(different.map((q) => q.id)).not.toEqual(first.map((q) => q.id));
  });

  it('has no duplicate ids/fingerprints and respects the 3/5/2 mix', () => {
    const selected = selectPracticeQuestions({
      questions: oneType,
      questionCount: 10,
      rng: seededRandom('mix'),
    });
    expect(new Set(selected.map((q) => q.id)).size).toBe(10);
    expect(new Set(selected.map((q) => q.fingerprint)).size).toBe(10);
    expect(selected.filter((q) => q.difficulty === 'EASY')).toHaveLength(3);
    expect(selected.filter((q) => q.difficulty === 'MEDIUM')).toHaveLength(5);
    expect(selected.filter((q) => q.difficulty === 'HARD')).toHaveLength(2);
  });

  it('rotates through all 100 questions before recycling recent items', () => {
    let history: RecentQuestionReference[] = [];
    const reached = new Set<string>();
    for (let session = 0; session < 10; session += 1) {
      const selected = selectPracticeQuestions({
        questions: oneType,
        questionCount: 10,
        recentQuestions: history,
        rng: seededRandom(`session-${session}`),
      });
      expect(selected.some((question) => reached.has(question.id))).toBe(false);
      selected.forEach((question) => reached.add(question.id));
      history = [
        ...history,
        ...selected.map((question) => ({
          problemTypeId: question.problemTypeId,
          questionId: question.id,
          fingerprint: question.fingerprint,
          lastSeenAt: new Date(2026, 0, session + 1).toISOString(),
        })),
      ];
    }
    expect(reached.size).toBe(100);
    const recycled = selectPracticeQuestions({
      questions: oneType,
      questionCount: 10,
      recentQuestions: history,
      rng: seededRandom('recycle'),
    });
    expect(recycled).toHaveLength(10);
    expect(recycled.every((question) => reached.has(question.id))).toBe(true);
  });

  it('balances problem types and templates in a mixed session', () => {
    const questions = finalizedProblemBlueprints
      .slice(0, 3)
      .flatMap((type) => bank.shards.get(type.id)!);
    const selected = selectPracticeQuestions({
      questions,
      questionCount: 10,
      rng: seededRandom('mixed'),
    });
    expect(new Set(selected.map((q) => q.problemTypeId)).size).toBe(3);
    expect(new Set(selected.map((q) => q.templateId)).size).toBeGreaterThanOrEqual(5);
  });
});
