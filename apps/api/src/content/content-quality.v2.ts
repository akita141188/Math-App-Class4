import type { Question } from '@math-app/shared';
import { domains, topics } from './catalog.data';
import {
  finalizedProblemBlueprints,
  GRADE4_CONTENT_VERSION,
  MAX_QUESTIONS_PER_LEAF_TYPE,
  MIN_QUESTIONS_PER_LEAF_TYPE,
} from './catalog.v2.data';
import { finalizedSkills } from './catalog.v2-derived';
import { stableStringify } from './generation/content-math';

export type ContentIssueCode =
  | 'MATH_ERROR'
  | 'AMBIGUOUS_WORDING'
  | 'ANSWER_MISMATCH'
  | 'VISUAL_MISMATCH'
  | 'UNIT_ERROR'
  | 'OPTION_COLLISION'
  | 'DUPLICATE_QUESTION'
  | 'INVALID_DIFFICULTY'
  | 'BAD_HINT'
  | 'BAD_EXPLANATION'
  | 'GRADE_MISMATCH'
  | 'CURRICULUM_GAP'
  | 'BROKEN_REFERENCE'
  | 'SCHEMA_ERROR';

export interface ContentIssue {
  code: ContentIssueCode;
  questionId?: string;
  problemTypeId?: string;
  message: string;
}

function fractionFromText(value: string) {
  const match = value.trim().match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (!match) return null;
  return { numerator: Number(match[1]), denominator: Number(match[2]) };
}

function fractionEqual(
  a: { numerator: number; denominator: number },
  b: { numerator: number; denominator: number },
) {
  return (
    a.denominator !== 0 &&
    b.denominator !== 0 &&
    a.numerator * b.denominator === b.numerator * a.denominator
  );
}

function expectedFraction(question: Question) {
  const expectedAnswer = question.expectedAnswer;
  if (expectedAnswer.kind === 'FRACTION') return expectedAnswer;
  if (expectedAnswer.kind !== 'OPTION') return null;
  const label = question.options?.find((option) => option.id === expectedAnswer.optionId)?.label;
  return label ? fractionFromText(label) : null;
}

function auditVisual(question: Question, issues: ContentIssue[]) {
  const visual = question.visual;
  if (!visual) return;
  if (!visual.alt.trim())
    issues.push({ code: 'SCHEMA_ERROR', questionId: question.id, message: 'Visual alt is empty.' });
  if (visual.type === 'FRACTION_BAR' || visual.type === 'FRACTION_CIRCLE') {
    if (
      !Number.isInteger(visual.equalParts) ||
      visual.equalParts < 2 ||
      !Number.isInteger(visual.shadedParts) ||
      visual.shadedParts < 0 ||
      visual.shadedParts > visual.equalParts
    ) {
      issues.push({
        code: 'VISUAL_MISMATCH',
        questionId: question.id,
        message: 'Fraction visual has invalid part counts.',
      });
      return;
    }
    const expected = expectedFraction(question);
    if (
      expected &&
      (expected.numerator !== visual.shadedParts || expected.denominator !== visual.equalParts)
    )
      issues.push({
        code: 'VISUAL_MISMATCH',
        questionId: question.id,
        message: 'Fraction visual contradicts the expected teaching form.',
      });
    if (question.expectedAnswer.kind === 'BOOLEAN') {
      const claims = [...question.stem.matchAll(/(\d+)\s*\/\s*(\d+)/g)];
      const claim = claims.at(-1);
      const matches = claim
        ? fractionEqual(
            { numerator: Number(claim[1]), denominator: Number(claim[2]) },
            { numerator: visual.shadedParts, denominator: visual.equalParts },
          )
        : false;
      if (matches !== question.expectedAnswer.value)
        issues.push({
          code: 'VISUAL_MISMATCH',
          questionId: question.id,
          message: 'True/false fraction claim contradicts the visual.',
        });
    }
  }
  if (
    visual.type === 'ANGLE' &&
    (!Number.isFinite(visual.degrees) || visual.degrees <= 0 || visual.degrees > 180)
  )
    issues.push({
      code: 'VISUAL_MISMATCH',
      questionId: question.id,
      message: 'Angle visual must be greater than 0 degrees and at most 180 degrees.',
    });
  if (
    visual.type === 'NUMBER_LINE' &&
    (!(visual.start < visual.end) || visual.marker < visual.start || visual.marker > visual.end)
  )
    issues.push({
      code: 'VISUAL_MISMATCH',
      questionId: question.id,
      message: 'Number-line marker is outside its interval.',
    });
  if (
    visual.type === 'CLOCK' &&
    (!Number.isInteger(visual.hour) ||
      visual.hour < 0 ||
      visual.hour > 23 ||
      !Number.isInteger(visual.minute) ||
      visual.minute < 0 ||
      visual.minute > 59)
  )
    issues.push({
      code: 'VISUAL_MISMATCH',
      questionId: question.id,
      message: 'Clock contains an invalid time.',
    });
  if (
    visual.type === 'GEOMETRY_DIAGRAM' &&
    (visual.width <= 0 ||
      visual.height <= 0 ||
      (visual.shape === 'SQUARE' && visual.width !== visual.height))
  )
    issues.push({
      code: 'VISUAL_MISMATCH',
      questionId: question.id,
      message: 'Geometry dimensions contradict the shape.',
    });
  if (
    visual.type === 'BAR_CHART' &&
    (visual.bars.length < 2 || visual.bars.some((bar) => !bar.label.trim() || bar.value < 0))
  )
    issues.push({
      code: 'VISUAL_MISMATCH',
      questionId: question.id,
      message: 'Bar-chart data is invalid.',
    });
}

function auditOptions(question: Question, issues: ContentIssue[]) {
  if (question.format !== 'MULTIPLE_CHOICE') return;
  if (
    question.expectedAnswer.kind !== 'OPTION' ||
    !question.options ||
    question.options.length !== 4
  ) {
    issues.push({
      code: 'OPTION_COLLISION',
      questionId: question.id,
      message: 'Single-choice question must have four options and one answer id.',
    });
    return;
  }
  const expectedAnswer = question.expectedAnswer;
  const labels = question.options.map((option) => option.label.trim().toLocaleLowerCase('vi'));
  if (new Set(labels).size !== labels.length)
    issues.push({
      code: 'OPTION_COLLISION',
      questionId: question.id,
      message: 'Duplicate option labels.',
    });
  if (
    expectedAnswer.kind === 'OPTION' &&
    !question.options.some((option) => option.id === expectedAnswer.optionId)
  )
    issues.push({
      code: 'ANSWER_MISMATCH',
      questionId: question.id,
      message: 'Correct option id is missing.',
    });
  const fractionOptions = question.options
    .map((option) => ({ option, fraction: fractionFromText(option.label) }))
    .filter((item) => item.fraction !== null);
  for (let left = 0; left < fractionOptions.length; left += 1) {
    for (let right = left + 1; right < fractionOptions.length; right += 1) {
      if (fractionEqual(fractionOptions[left]!.fraction!, fractionOptions[right]!.fraction!))
        issues.push({
          code: 'OPTION_COLLISION',
          questionId: question.id,
          message: `Equivalent fraction options ${fractionOptions[left]!.option.label} and ${fractionOptions[right]!.option.label}.`,
        });
    }
  }
}

function auditPlaceValue(question: Question, issues: ContentIssue[]) {
  if (question.problemTypeId !== 'digit-place-value') return;
  const match = question.stem.match(/trong số\s+([\d.\s]+),\s*chữ số\s+(\d)/i);
  if (!match) return;
  const occurrences = [...(match[1] ?? '').replace(/\D/g, '')].filter(
    (digit) => digit === match[2],
  ).length;
  const identifies =
    /chữ số\s+\d\s+(?:ở\s+)?hàng\s+/i.test(question.stem) ||
    /chữ số\s+\d\s+(?:ở\s+)?(?:vị trí|thứ)\s+/i.test(question.stem);
  if (occurrences > 1 && !identifies)
    issues.push({
      code: 'AMBIGUOUS_WORDING',
      questionId: question.id,
      message: 'Repeated target digit is not identified by place or occurrence.',
    });
}

export function auditQuestion(question: Question): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (
    question.grade !== 4 ||
    question.version !== 2 ||
    question.contentVersion !== GRADE4_CONTENT_VERSION
  )
    issues.push({
      code: 'GRADE_MISMATCH',
      questionId: question.id,
      message: 'Question grade/content version is invalid.',
    });
  if (!question.id || !question.templateId || !question.fingerprint || !question.stem.trim())
    issues.push({
      code: 'SCHEMA_ERROR',
      questionId: question.id,
      message: 'Required identity/text field is missing.',
    });
  if (!['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty))
    issues.push({
      code: 'INVALID_DIFFICULTY',
      questionId: question.id,
      message: 'Difficulty is invalid.',
    });
  if (
    question.explanation.trim().length < 5 ||
    question.explanation.trim() === question.stem.trim() ||
    !/[0-9=]|vì|nên|có|được|là/i.test(question.explanation)
  )
    issues.push({
      code: 'BAD_EXPLANATION',
      questionId: question.id,
      message: 'Explanation is missing or does not add useful reasoning.',
    });
  if (
    question.hints.length !== 3 ||
    question.hints.some((hint) => !hint.text.trim()) ||
    question.hints.some((hint) => hint.text.includes(question.explanation))
  )
    issues.push({
      code: 'BAD_HINT',
      questionId: question.id,
      message: 'Hints are missing, empty, or reveal the full explanation.',
    });
  if (
    !domains.some((domain) => domain.id === question.domainId) ||
    !topics.some((topic) => topic.id === question.topicId) ||
    !finalizedSkills.some((skill) => skill.id === question.skillId) ||
    !finalizedProblemBlueprints.some((type) => type.id === question.problemTypeId)
  )
    issues.push({
      code: 'BROKEN_REFERENCE',
      questionId: question.id,
      message: 'Question hierarchy reference is broken.',
    });
  if (
    question.expectedAnswer.kind === 'FRACTION' &&
    (!Number.isInteger(question.expectedAnswer.numerator) ||
      !Number.isInteger(question.expectedAnswer.denominator) ||
      question.expectedAnswer.denominator < 2 ||
      question.expectedAnswer.numerator < 0)
  )
    issues.push({
      code: 'MATH_ERROR',
      questionId: question.id,
      message: 'Expected fraction is invalid.',
    });
  auditOptions(question, issues);
  auditVisual(question, issues);
  auditPlaceValue(question, issues);
  return issues;
}

export function auditBank(questions: readonly Question[]): ContentIssue[] {
  const issues = questions.flatMap(auditQuestion);
  const byId = new Map<string, number>();
  const byFingerprint = new Map<string, number>();
  for (const question of questions) {
    byId.set(question.id, (byId.get(question.id) ?? 0) + 1);
    byFingerprint.set(question.fingerprint, (byFingerprint.get(question.fingerprint) ?? 0) + 1);
  }
  for (const [id, count] of byId)
    if (count > 1)
      issues.push({
        code: 'DUPLICATE_QUESTION',
        questionId: id,
        message: `Duplicate question id occurs ${count} times.`,
      });
  for (const [fingerprint, count] of byFingerprint)
    if (count > 1)
      issues.push({
        code: 'DUPLICATE_QUESTION',
        message: `Duplicate fingerprint ${fingerprint} occurs ${count} times.`,
      });
  for (const type of finalizedProblemBlueprints) {
    const typeQuestions = questions.filter((question) => question.problemTypeId === type.id);
    const valid = typeQuestions.filter((question) => auditQuestion(question).length === 0);
    if (valid.length < MIN_QUESTIONS_PER_LEAF_TYPE)
      issues.push({
        code: 'CURRICULUM_GAP',
        problemTypeId: type.id,
        message: `${type.id} has ${valid.length} valid questions; at least ${MIN_QUESTIONS_PER_LEAF_TYPE} required.`,
      });
    if (valid.length > MAX_QUESTIONS_PER_LEAF_TYPE)
      issues.push({
        code: 'CURRICULUM_GAP',
        problemTypeId: type.id,
        message: `${type.id} has ${valid.length} valid questions; at most ${MAX_QUESTIONS_PER_LEAF_TYPE} allowed.`,
      });
  }
  return issues;
}

export function duplicateSummary(questions: readonly Question[]) {
  const duplicateIds = questions.length - new Set(questions.map((question) => question.id)).size;
  const duplicateFingerprints =
    questions.length - new Set(questions.map((question) => question.fingerprint)).size;
  return { duplicateIds, duplicateFingerprints };
}

export function contentStats(questions: readonly Question[]) {
  const counts = finalizedProblemBlueprints.map((type) => ({
    problemTypeId: type.id,
    count: questions.filter((question) => question.problemTypeId === type.id).length,
  }));
  const sorted = counts.map((item) => item.count).sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? ((sorted[sorted.length / 2 - 1] ?? 0) + (sorted[sorted.length / 2] ?? 0)) / 2
      : (sorted[Math.floor(sorted.length / 2)] ?? 0);
  const countBy = (selector: (question: Question) => string | undefined) =>
    questions.reduce<Record<string, number>>((result, question) => {
      const key = selector(question) ?? 'NONE';
      result[key] = (result[key] ?? 0) + 1;
      return result;
    }, {});
  const issues = auditBank(questions);
  return {
    domains: domains.length,
    topics: topics.length,
    skills: finalizedSkills.length,
    selectableLeafTypes: finalizedProblemBlueprints.length,
    totalQuestions: questions.length,
    minimumQuestionsPerType: sorted[0] ?? 0,
    maximumQuestionsPerType: sorted.at(-1) ?? 0,
    medianQuestionsPerType: median,
    leafTypesBelow100: counts.filter((item) => item.count < MIN_QUESTIONS_PER_LEAF_TYPE).length,
    leafTypesAbove100: counts.filter((item) => item.count > MAX_QUESTIONS_PER_LEAF_TYPE).length,
    countsByProblemType: counts,
    countsByDifficulty: countBy((question) => question.difficulty),
    countsByFormat: countBy((question) => question.format),
    countsByVisualType: countBy((question) => question.visual?.type),
    ...duplicateSummary(questions),
    validationErrors: issues.length,
    ambiguityWarnings: issues.filter((issue) => issue.code === 'AMBIGUOUS_WORDING').length,
  };
}

export function canonicalQuestionSignature(question: Question) {
  return stableStringify(question);
}
