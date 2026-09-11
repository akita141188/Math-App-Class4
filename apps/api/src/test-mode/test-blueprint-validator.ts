import type { AssessmentLevel, Question, QuestionFormat, TestBlueprint } from '@math-app/shared';

const supportedFormats = new Set<QuestionFormat>([
  'SHORT_ANSWER',
  'FILL_BLANK',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'WRITTEN_SOLUTION',
]);

export function validateTestBlueprint(
  blueprint: TestBlueprint,
  questions: readonly Question[],
): string[] {
  const issues: string[] = [];
  const sectionQuestions = blueprint.sections.reduce(
    (sum, section) => sum + section.questionCount,
    0,
  );
  const sectionScore = blueprint.sections.reduce((sum, section) => sum + section.scoreWeight, 0);
  const levelCount = Object.values(blueprint.assessmentLevelDistribution).reduce(
    (sum, value) => sum + value,
    0,
  );
  const formatCount = Object.values(blueprint.formatDistribution).reduce(
    (sum, value) => sum + (value ?? 0),
    0,
  );
  if (blueprint.totalScore !== 10 || Math.abs(sectionScore - 10) > 0.0001)
    issues.push('invalid score total');
  if (sectionQuestions !== blueprint.questionCount) issues.push('section question total mismatch');
  if (levelCount !== blueprint.questionCount) issues.push('assessment-level imbalance');
  if (formatCount !== blueprint.questionCount) issues.push('format distribution mismatch');
  const configuredFormats = Object.keys(blueprint.formatDistribution) as QuestionFormat[];
  if (configuredFormats.some((format) => !supportedFormats.has(format)))
    issues.push('unsupported format');
  for (const topicId of blueprint.topicCoverage) {
    if (!questions.some((question) => question.testEligible && question.topicId === topicId))
      issues.push(`topic coverage missing: ${topicId}`);
  }
  for (const [level, count] of Object.entries(blueprint.assessmentLevelDistribution) as Array<
    [AssessmentLevel, number]
  >) {
    if (
      questions.filter(
        (question) =>
          question.testEligible &&
          blueprint.topicCoverage.includes(question.topicId) &&
          question.assessmentLevel === level,
      ).length < count
    )
      issues.push(`not enough eligible questions for ${level}`);
  }
  for (const [format, count] of Object.entries(blueprint.formatDistribution) as Array<
    [QuestionFormat, number]
  >) {
    if (
      questions.filter(
        (question) =>
          question.testEligible &&
          blueprint.topicCoverage.includes(question.topicId) &&
          question.format === format,
      ).length < count
    )
      issues.push(`not enough eligible questions for ${format}`);
  }
  return issues;
}
