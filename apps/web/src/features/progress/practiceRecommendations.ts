import type { CurriculumCatalog, ProblemTypeSummary, ProgressSummary } from '@math-app/shared';

const dailyFallbackIds = [
  'multiply-one-digit',
  'length-conversion',
  'identify-fraction',
  'column-addition',
  'two-step-problem',
  'rectangle-area',
  'read-bar-chart',
];

export function buildWeakSkillRecommendations(
  progress: ProgressSummary,
  catalog: CurriculumCatalog,
): ProblemTypeSummary[] {
  const bySkill = new Map(catalog.problemTypes.map((item) => [item.skillId, item]));
  return progress.skills
    .filter((skill) => skill.masteryLevel === 'NEEDS_REVIEW' || skill.incorrect > skill.correct)
    .sort(
      (left, right) =>
        right.incorrect - left.incorrect ||
        Date.parse(right.lastPracticedAt) - Date.parse(left.lastPracticedAt),
    )
    .map((skill) => bySkill.get(skill.skillId))
    .filter((item): item is ProblemTypeSummary => Boolean(item));
}

export function buildDailyProblemTypeIds(
  progress: ProgressSummary,
  catalog: CurriculumCatalog,
): string[] {
  const availableIds = new Set(catalog.problemTypes.map((item) => item.id));
  const weakIds = buildWeakSkillRecommendations(progress, catalog).map((item) => item.id);
  const result: string[] = [];
  for (const id of [
    ...weakIds,
    ...dailyFallbackIds,
    ...catalog.problemTypes.map((item) => item.id),
  ]) {
    if (availableIds.has(id) && !result.includes(id)) result.push(id);
    if (result.length >= 7) break;
  }
  return result;
}

export function buildContinueProblemType(
  progress: ProgressSummary,
  catalog: CurriculumCatalog,
): ProblemTypeSummary | undefined {
  const bySkill = new Map(catalog.problemTypes.map((item) => [item.skillId, item]));
  const recentKnown = [...progress.skills]
    .sort((left, right) => Date.parse(right.lastPracticedAt) - Date.parse(left.lastPracticedAt))
    .map((skill) => bySkill.get(skill.skillId))
    .find((item): item is ProblemTypeSummary => Boolean(item));
  return recentKnown ?? catalog.problemTypes.find((item) => item.id === dailyFallbackIds[0]);
}
