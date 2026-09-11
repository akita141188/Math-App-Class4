import type { Question, TestBlueprint } from '@math-app/shared';
import { fisherYates } from '../content/generation/content-math';

export function assembleTestQuestions(
  blueprint: TestBlueprint,
  bank: readonly Question[],
  rng: () => number,
  recentQuestionIds: readonly string[] = [],
): Question[] {
  const recent = new Set(recentQuestionIds);
  const eligible = bank.filter(
    (question) => question.testEligible && blueprint.topicCoverage.includes(question.topicId),
  );
  const unseen = fisherYates(
    eligible.filter((question) => !recent.has(question.id)),
    rng,
  );
  const seen = fisherYates(
    eligible.filter((question) => recent.has(question.id)),
    rng,
  );
  const candidates = [...unseen, ...seen];
  const levelRemaining = { ...blueprint.assessmentLevelDistribution };
  const formatRemaining = { ...blueprint.formatDistribution };
  const selected: Question[] = [];

  const take = (predicate: (question: Question) => boolean): boolean => {
    const index = candidates.findIndex(
      (question) =>
        predicate(question) &&
        levelRemaining[question.assessmentLevel] > 0 &&
        (formatRemaining[question.format] ?? 0) > 0 &&
        !selected.some(
          (item) => item.id === question.id || item.fingerprint === question.fingerprint,
        ),
    );
    if (index < 0) return false;
    const [question] = candidates.splice(index, 1);
    selected.push(question!);
    levelRemaining[question!.assessmentLevel] -= 1;
    formatRemaining[question!.format] = (formatRemaining[question!.format] ?? 0) - 1;
    return true;
  };

  for (const topicId of blueprint.topicCoverage) {
    if (!take((question) => question.topicId === topicId))
      throw new Error(`Blueprint cannot cover topic ${topicId} with remaining constraints.`);
  }
  while (selected.length < blueprint.questionCount) {
    if (!take(() => true))
      throw new Error('Not enough eligible questions to satisfy blueprint constraints.');
  }
  const remainingLevels = Object.values(levelRemaining).reduce((sum, value) => sum + value, 0);
  const remainingFormats = Object.values(formatRemaining).reduce(
    (sum, value) => sum + (value ?? 0),
    0,
  );
  if (remainingLevels !== 0 || remainingFormats !== 0)
    throw new Error('Blueprint distribution was not satisfied.');
  return selected;
}
