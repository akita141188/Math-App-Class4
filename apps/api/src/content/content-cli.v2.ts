import { resolve } from 'node:path';

const command = process.argv[2];
const bankDirectory = resolve(__dirname, 'banks', 'grade-4', 'v3');

async function main() {
  if (command === 'build-bank') {
    const { materializeBank } = await import('./generation/bank-builder');
    const manifest = materializeBank(bankDirectory);
    console.info(`Materialized ${manifest.problemTypes.length} JSON shards in ${bankDirectory}`);
    console.info(
      `Total questions: ${manifest.problemTypes.reduce((sum, item) => sum + item.questionCount, 0)}`,
    );
    return;
  }

  const { loadCanonicalGrade4Bank } = await import('./bank-loader');
  const { contentStats, duplicateSummary } = await import('./content-quality.v2');
  const { deepAuditBank } = await import('./deep-audit');
  const bank = loadCanonicalGrade4Bank(bankDirectory);
  const issues = deepAuditBank(bank.questions);

  if (command === 'validate') {
    const stats = contentStats(bank.questions);
    console.info(`Leaf types below 100: ${stats.leafTypesBelow100}`);
    console.info(`Leaf types above 100: ${stats.leafTypesAbove100}`);
    if (issues.length > 0) {
      console.error(`CONTENT INVALID: ${issues.length} error(s)`);
      for (const issue of issues.slice(0, 200))
        console.error(
          `${issue.code}: ${issue.questionId ?? issue.problemTypeId ?? 'BANK'}: ${issue.message}`,
        );
      process.exitCode = 1;
    } else {
      console.info('CONTENT VALID: schema, math, wording, references, options and visuals passed');
    }
    return;
  }

  if (command === 'stats') {
    const stats = contentStats(bank.questions);
    console.info(`Leaf types: ${stats.selectableLeafTypes}`);
    console.info(`Total questions: ${stats.totalQuestions}`);
    console.info(`Minimum questions/leaf type: ${stats.minimumQuestionsPerType}`);
    console.info(`Maximum questions/leaf type: ${stats.maximumQuestionsPerType}`);
    console.info(`Median questions/leaf type: ${stats.medianQuestionsPerType}`);
    console.info(`Leaf types below 100: ${stats.leafTypesBelow100}`);
    console.info(`Leaf types above 100: ${stats.leafTypesAbove100}`);
    console.info(`EASY: ${stats.countsByDifficulty.EASY ?? 0}`);
    console.info(`MEDIUM: ${stats.countsByDifficulty.MEDIUM ?? 0}`);
    console.info(`HARD: ${stats.countsByDifficulty.HARD ?? 0}`);
    return;
  }

  if (command === 'duplicates') {
    const duplicates = duplicateSummary(bank.questions);
    console.info(`Duplicate question IDs: ${duplicates.duplicateIds}`);
    console.info(`Duplicate fingerprints: ${duplicates.duplicateFingerprints}`);
    if (duplicates.duplicateIds > 0 || duplicates.duplicateFingerprints > 0) process.exitCode = 1;
    return;
  }

  if (command === 'audit') {
    const categories = issues.reduce<Record<string, number>>((result, issue) => {
      result[issue.code] = (result[issue.code] ?? 0) + 1;
      return result;
    }, {});
    for (const category of [
      'MATH_ERROR',
      'AMBIGUOUS_WORDING',
      'ANSWER_MISMATCH',
      'VISUAL_MISMATCH',
      'UNIT_ERROR',
      'OPTION_COLLISION',
      'DUPLICATE_QUESTION',
      'INVALID_DIFFICULTY',
      'BAD_HINT',
      'BAD_EXPLANATION',
      'GRADE_MISMATCH',
      'CURRICULUM_GAP',
      'BROKEN_REFERENCE',
      'SCHEMA_ERROR',
    ])
      console.info(`${category}: ${categories[category] ?? 0}`);
    console.info(`ERRORS: ${issues.length}`);
    if (issues.length > 0) process.exitCode = 1;
    return;
  }

  if (command === 'review-export') {
    const { exportReviewHtml } = await import('./review-export');
    const output = resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '.tmp',
      'content-review',
      'grade4-review.html',
    );
    exportReviewHtml(bank.questions, output);
    console.info(`Review export: ${output}`);
    console.info(`Questions exported: ${bank.questions.length}`);
    return;
  }

  console.error(
    'Usage: content-cli.v2.ts <build-bank|validate|stats|duplicates|audit|review-export>',
  );
  process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exitCode = 1;
});
