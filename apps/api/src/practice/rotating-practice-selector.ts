import type { Difficulty, Question, RecentQuestionReference } from '@math-app/shared';
import { fisherYates } from '../content/generation/content-math';

export interface RotatingSelectionInput {
  questions: readonly Question[];
  questionCount: number;
  difficulty?: Difficulty;
  recentQuestions?: readonly RecentQuestionReference[];
  rng?: () => number;
}

function unique(questions: readonly Question[]): Question[] {
  const ids = new Set<string>();
  const fingerprints = new Set<string>();
  return questions.filter((question) => {
    if (ids.has(question.id) || fingerprints.has(question.fingerprint)) return false;
    ids.add(question.id);
    fingerprints.add(question.fingerprint);
    return true;
  });
}

function targets(count: number): Record<Difficulty, number> {
  const easy = Math.floor(count * 0.3);
  const hard = Math.floor(count * 0.2);
  return { EASY: easy, MEDIUM: count - easy - hard, HARD: hard };
}

function balancedPick(
  candidates: readonly Question[],
  count: number,
  prior: readonly Question[],
  rng: () => number,
): Question[] {
  const remaining = fisherYates(candidates, rng);
  const result: Question[] = [];
  while (remaining.length > 0 && result.length < count) {
    const chosen = [...prior, ...result];
    const typeCounts = new Map<string, number>();
    const templateCounts = new Map<string, number>();
    for (const question of chosen) {
      typeCounts.set(question.problemTypeId, (typeCounts.get(question.problemTypeId) ?? 0) + 1);
      templateCounts.set(question.templateId, (templateCounts.get(question.templateId) ?? 0) + 1);
    }
    const scores = remaining.map(
      (question) =>
        (typeCounts.get(question.problemTypeId) ?? 0) * 100 +
        (templateCounts.get(question.templateId) ?? 0) * 10,
    );
    const minimum = Math.min(...scores);
    const eligibleIndexes = scores.flatMap((score, index) => (score === minimum ? [index] : []));
    const index = eligibleIndexes[Math.floor(rng() * eligibleIndexes.length)]!;
    result.push(remaining[index]!);
    remaining.splice(index, 1);
  }
  return result;
}

export function selectRotatingPracticeQuestions(input: RotatingSelectionInput): Question[] {
  const rng = input.rng ?? Math.random;
  const recent = input.recentQuestions ?? [];
  const seenIds = new Set(recent.map((item) => item.questionId));
  const seenFingerprints = new Set(recent.map((item) => item.fingerprint));
  const lastSeen = new Map<string, string>();
  for (const item of recent) {
    const prior = lastSeen.get(item.questionId);
    if (!prior || item.lastSeenAt > prior) lastSeen.set(item.questionId, item.lastSeenAt);
  }
  let pool = unique(input.questions);
  if (input.difficulty) pool = pool.filter((question) => question.difficulty === input.difficulty);
  const unseen = pool.filter(
    (question) => !seenIds.has(question.id) && !seenFingerprints.has(question.fingerprint),
  );
  const selected: Question[] = [];

  if (input.difficulty) {
    selected.push(
      ...balancedPick(unseen, Math.min(input.questionCount, unseen.length), selected, rng),
    );
  } else {
    const quota = targets(input.questionCount);
    for (const difficulty of ['EASY', 'MEDIUM', 'HARD'] as const) {
      const candidates = unseen.filter((question) => question.difficulty === difficulty);
      selected.push(
        ...balancedPick(candidates, Math.min(quota[difficulty], candidates.length), selected, rng),
      );
    }
  }

  if (selected.length < input.questionCount) {
    const selectedIds = new Set(selected.map((question) => question.id));
    selected.push(
      ...balancedPick(
        unseen.filter((question) => !selectedIds.has(question.id)),
        input.questionCount - selected.length,
        selected,
        rng,
      ),
    );
  }

  if (selected.length < input.questionCount) {
    const selectedIds = new Set(selected.map((question) => question.id));
    const recycled = pool
      .filter((question) => !selectedIds.has(question.id))
      .sort((left, right) =>
        (lastSeen.get(left.id) ?? '').localeCompare(lastSeen.get(right.id) ?? ''),
      );
    while (selected.length < input.questionCount && recycled.length > 0) {
      const oldest = lastSeen.get(recycled[0]!.id) ?? '';
      const oldestPool = recycled.filter(
        (question) => (lastSeen.get(question.id) ?? '') === oldest,
      );
      const picked = balancedPick(
        oldestPool,
        Math.min(input.questionCount - selected.length, oldestPool.length),
        selected,
        rng,
      );
      selected.push(...picked);
      const pickedIds = new Set(picked.map((question) => question.id));
      for (let index = recycled.length - 1; index >= 0; index -= 1)
        if (pickedIds.has(recycled[index]!.id)) recycled.splice(index, 1);
    }
  }
  return fisherYates(selected, rng);
}
