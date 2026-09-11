import type { Question } from '@math-app/shared';
import { finalizedProblemBlueprints, QUESTIONS_PER_PROBLEM_TYPE } from './catalog.v2.data';
import { auditBank, type ContentIssue } from './content-quality.v2';
import { stableStringify } from './generation/content-math';
import { generateQuestion } from './generation/question-generator.v2';
import { auditQuestionUnits } from './unit-oracle-audit';

function presentationSignature(question: Question): string {
  return stableStringify({
    problemTypeId: question.problemTypeId,
    templateId: question.templateId,
    stem: question.stem.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi'),
    expectedAnswer: question.expectedAnswer,
    visual: question.visual ?? null,
    options: question.options ?? null,
    orderingItems: question.orderingItems ?? null,
    matchingPairs: question.matchingPairs ?? null,
  });
}

export function deepAuditBank(questions: readonly Question[]): ContentIssue[] {
  const issues = [...auditBank(questions), ...questions.flatMap(auditQuestionUnits)];
  const presentations = new Map<string, string>();
  for (const question of questions) {
    const signature = presentationSignature(question);
    const previous = presentations.get(signature);
    if (previous)
      issues.push({
        code: 'DUPLICATE_QUESTION',
        questionId: question.id,
        message: `Student-visible question duplicates ${previous}; hidden parameters do not make it unique.`,
      });
    else presentations.set(signature, question.id);
  }

  const expectedById = new Map(
    finalizedProblemBlueprints.flatMap((type) =>
      Array.from({ length: QUESTIONS_PER_PROBLEM_TYPE }, (_, index) => {
        const expected = generateQuestion(type, index);
        return [expected.id, expected] as const;
      }),
    ),
  );
  for (const question of questions) {
    const canonical = expectedById.get(question.id);
    if (!canonical) {
      issues.push({
        code: 'ANSWER_MISMATCH',
        questionId: question.id,
        message: 'Question id cannot be reproduced by the reviewed generator.',
      });
      continue;
    }
    const canonicalJson = JSON.parse(JSON.stringify(canonical)) as unknown;
    const materializedJson = JSON.parse(JSON.stringify(question)) as unknown;
    if (stableStringify(canonicalJson) !== stableStringify(materializedJson))
      issues.push({
        code: 'ANSWER_MISMATCH',
        questionId: question.id,
        message: 'Materialized record differs from deterministic generator output.',
      });
  }
  return issues;
}
