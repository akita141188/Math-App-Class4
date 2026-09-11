import type { Difficulty, Question, RecentQuestionReference } from '@math-app/shared';
import { fisherYates } from '../content/generation/content-math';

export interface PracticeSelectionInput {
  questions: readonly Question[];
  questionCount: number;
  difficulty?: Difficulty;
  recentQuestions?: readonly RecentQuestionReference[];
  rng?: () => number;
}

function difficultyTargets(count: number): Record<Difficulty, number> {
  const easy = Math.floor(count * 0.3);
  const hard = Math.floor(count * 0.2);
  return { EASY: easy, MEDIUM: count - easy - hard, HARD: hard };
}

function uniquePool(questions: readonly Question[]): Question[] {
  const ids = new Set<string>();
  const fingerprints = new Set<string>();
  return questions.filter((question) => {
    if (ids.has(question.id) || fingerprints.has(question.fingerprint)) return false;
    ids.add(question.id);
    fingerprints.add(question.fingerprint);
    return true;
  });
}

function pickBalanced(
  candidates: readonly Question[],
  count: number,
  selected: readonly Question[],
  rng: () => number,
  recentById: ReadonlyMap<string, RecentQuestionReference>,
): Question[] {
  const result: Question[] = [];
  const remaining = fisherYates(candidates, rng);
  while (result.length < count && remaining.length > 0) {
    const allSelected = [...selected, ...result];
    const typeCounts = new Map<string, number>();
    const templateCounts = new Map<string, number>();
    for (const question of allSelected) {
      typeCounts.set(question.problemTypeId, (typeCounts.get(question.problemTypeId) ?? 0) + 1);
      templateCounts.set(question.templateId, (templateCounts.get(question.templateId) ?? 0) + 1);
    }
    const unseen = remaining.filter((question) => !recentById.has(question.id));
    const source = unseen.length > 0 ? unseen : remaining;
    const oldestTimestamp = source.reduce((oldest, question) => {
      const seen = recentById.get(question.id)?.lastSeenAt;
      return seen && seen < oldest ? seen : oldest;
    }, '9999-12-31T23:59:59.999Z');
    const rotationPool =
      unseen.length > 0
        ? source
        : source.filter((question) => recentById.get(question.id)?.lastSeenAt === oldestTimestamp);
    const scored = rotationPool.map((question) => ({
      question,
      score:
        (typeCounts.get(question.problemTypeId) ?? 0) * 100 +
        (templateCounts.get(question.templateId) ?? 0) * 10,
    }));
    const minScore = Math.min(...scored.map((item) => item.score));
    const best = scored.filter((item) => item.score === minScore);
    const chosen = best[Math.floor(rng() * best.length)]!.question;
    result.push(chosen);
    remaining.splice(
      remaining.findIndex((question) => question.id === chosen.id),
      1,
    );
  }
  return result;
}

export function selectPracticeQuestions(input: PracticeSelectionInput): Question[] {
  const rng = input.rng ?? Math.random;
  const recentById = new Map((input.recentQuestions ?? []).map((item) => [item.questionId, item]));
  const recentFingerprints = new Set((input.recentQuestions ?? []).map((item) => item.fingerprint));
  const pool = uniquePool(input.questions).filter(
    (question) => !recentFingerprints.has(question.fingerprint) || recentById.has(question.id),
  );
  if (input.difficulty) {
    return fisherYates(
      pickBalanced(
        pool.filter((question) => question.difficulty === input.difficulty),
        input.questionCount,
        [],
        rng,
        recentById,
      ),
      rng,
    );
  }
  const targets = difficultyTargets(input.questionCount);
  const selected: Question[] = [];
  for (const difficulty of ['EASY', 'MEDIUM', 'HARD'] as const) {
    selected.push(
      ...pickBalanced(
        pool.filter((question) => question.difficulty === difficulty),
        targets[difficulty],
        selected,
        rng,
        recentById,
      ),
    );
  }
  if (selected.length < input.questionCount) {
    const chosenIds = new Set(selected.map((question) => question.id));
    selected.push(
      ...pickBalanced(
        pool.filter((question) => !chosenIds.has(question.id)),
        input.questionCount - selected.length,
        selected,
        rng,
        recentById,
      ),
    );
  }
  return fisherYates(selected, rng);
}
