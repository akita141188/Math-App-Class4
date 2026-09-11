import type { RecentQuestionReference } from '@math-app/shared';
import { finalizedProblemBlueprints } from '../content/catalog.v2.data';
import { buildBankInMemory } from '../content/generation/bank-builder';
import { seededRandom } from '../content/generation/content-math';
import { selectRotatingPracticeQuestions } from './rotating-practice-selector';

describe('rotating practice selector', () => {
  const bank = buildBankInMemory('test');
  const questions = bank.shards.get(finalizedProblemBlueprints[0]!.id)!;

  it('uses the 3/5/2 mix while every band has enough unseen questions', () => {
    const selected = selectRotatingPracticeQuestions({
      questions,
      questionCount: 10,
      rng: seededRandom('mix'),
    });
    expect(selected.filter((question) => question.difficulty === 'EASY')).toHaveLength(3);
    expect(selected.filter((question) => question.difficulty === 'MEDIUM')).toHaveLength(5);
    expect(selected.filter((question) => question.difficulty === 'HARD')).toHaveLength(2);
  });

  it('reaches all 100 unique questions before recycling', () => {
    const recent: RecentQuestionReference[] = [];
    const reached = new Set<string>();
    for (let session = 0; session < 10; session += 1) {
      const selected = selectRotatingPracticeQuestions({
        questions,
        questionCount: 10,
        recentQuestions: recent,
        rng: seededRandom(`rotation-${session}`),
      });
      expect(selected).toHaveLength(10);
      expect(selected.some((question) => reached.has(question.id))).toBe(false);
      const lastSeenAt = new Date(Date.UTC(2026, 0, session + 1)).toISOString();
      recent.push(
        ...selected.map((question) => ({
          problemTypeId: question.problemTypeId,
          questionId: question.id,
          fingerprint: question.fingerprint,
          lastSeenAt,
        })),
      );
      selected.forEach((question) => reached.add(question.id));
    }
    expect(reached.size).toBe(100);
  });

  it('recycles the oldest-seen bucket after exhaustion', () => {
    const recent = questions.map((question, index) => ({
      problemTypeId: question.problemTypeId,
      questionId: question.id,
      fingerprint: question.fingerprint,
      lastSeenAt: new Date(Date.UTC(2026, 0, Math.floor(index / 10) + 1)).toISOString(),
    }));
    const selected = selectRotatingPracticeQuestions({
      questions,
      questionCount: 10,
      recentQuestions: recent,
      rng: seededRandom('oldest'),
    });
    const oldestIds = new Set(questions.slice(0, 10).map((question) => question.id));
    expect(selected.every((question) => oldestIds.has(question.id))).toBe(true);
  });
});
