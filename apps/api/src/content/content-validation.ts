import type { Question, QuestionFormat } from '@math-app/shared';
import { domains, problemBlueprints, skills, topics } from './catalog.data';
import { questionBank } from './question-bank.data';

export interface ContentStats {
  domains: number;
  topics: number;
  skills: number;
  problemTypes: number;
  questions: number;
  byFormat: Record<string, number>;
  byDifficulty: Record<string, number>;
  visualQuestions: number;
  visualPercentage: number;
  reviewedQuestions: number;
  coverageGaps: string[];
}

const supportedFormats = new Set<QuestionFormat>([
  'SHORT_ANSWER',
  'MULTIPLE_CHOICE',
  'MULTIPLE_SELECT',
  'TRUE_FALSE',
  'FILL_BLANK',
  'ORDERING',
  'MATCHING',
  'WRITTEN_SOLUTION',
]);

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

interface FractionValue {
  numerator: number;
  denominator: number;
}

function fractionFromText(value: string): FractionValue | null {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return null;
  return { numerator: Number(match[1]), denominator: Number(match[2]) };
}

function sameFraction(left: FractionValue, right: FractionValue): boolean {
  return left.numerator * right.denominator === right.numerator * left.denominator;
}

function expectedVisualFraction(question: Question): FractionValue | null {
  if (question.expectedAnswer.kind === 'FRACTION') return question.expectedAnswer;
  if (question.expectedAnswer.kind === 'OPTION') {
    const optionId = question.expectedAnswer.optionId;
    const option = question.options?.find((candidate) => candidate.id === optionId);
    return option ? fractionFromText(option.label) : null;
  }
  return null;
}

export function findAmbiguousPlaceValueReference(question: Question): string | null {
  if (!['read-write-numbers', 'digit-place-value'].includes(question.problemTypeId)) return null;
  const reference = question.stem.match(/trong số\s+([\d.\s]+),\s*chữ số\s+(\d)/i);
  if (!reference) return null;
  const digits = reference[1]?.replace(/\D/g, '') ?? '';
  const targetDigit = reference[2] ?? '';
  const occurrences = [...digits].filter((digit) => digit === targetDigit).length;
  const identifiesOccurrence =
    /chữ số\s+\d\s+(?:ở\s+)?hàng\s+/i.test(question.stem) ||
    /chữ số\s+\d\s+(?:ở\s+)?(?:vị trí|thứ)\s+/i.test(question.stem) ||
    /chữ số\s+\d\s+(?:bên trái|bên phải)/i.test(question.stem);
  return occurrences > 1 && !identifiesOccurrence
    ? `${question.id}: ambiguous repeated digit in place-value question`
    : null;
}

export function validateQuestionContent(question: Question): string[] {
  const issues: string[] = [];
  if (!topics.some((topic) => topic.id === question.topicId))
    issues.push(`${question.id}: missing topic`);
  if (!skills.some((skill) => skill.id === question.skillId))
    issues.push(`${question.id}: missing skill`);
  if (!problemBlueprints.some((item) => item.id === question.problemTypeId))
    issues.push(`${question.id}: invalid problem type`);
  if (!supportedFormats.has(question.format)) issues.push(`${question.id}: unsupported format`);
  if (!question.stem.trim()) issues.push(`${question.id}: empty stem`);
  if (!question.explanation.trim()) issues.push(`${question.id}: empty explanation`);
  if (question.hints.length < 2 || question.hints.some((hint) => !hint.text.trim()))
    issues.push(`${question.id}: malformed hints`);
  if (!['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty))
    issues.push(`${question.id}: invalid difficulty`);
  if (question.format === 'MULTIPLE_CHOICE') {
    if (!question.options || question.options.length < 2)
      issues.push(`${question.id}: invalid choices`);
    if (question.expectedAnswer.kind !== 'OPTION') {
      issues.push(`${question.id}: no valid correct choice`);
    } else {
      const correctOptionId = question.expectedAnswer.optionId;
      if (!question.options?.some((option) => option.id === correctOptionId)) {
        issues.push(`${question.id}: no valid correct choice`);
      }
    }
  }
  if (question.format === 'MULTIPLE_SELECT' && question.expectedAnswer.kind !== 'OPTIONS') {
    issues.push(`${question.id}: invalid multiple-select answer`);
  }
  if (question.format === 'TRUE_FALSE' && question.expectedAnswer.kind !== 'BOOLEAN') {
    issues.push(`${question.id}: invalid true-false answer`);
  }
  if (
    question.expectedAnswer.kind === 'FRACTION' &&
    (!Number.isInteger(question.expectedAnswer.denominator) ||
      !Number.isInteger(question.expectedAnswer.numerator) ||
      question.expectedAnswer.denominator < 2 ||
      question.expectedAnswer.numerator < 0 ||
      question.expectedAnswer.numerator > question.expectedAnswer.denominator)
  ) {
    issues.push(`${question.id}: invalid fraction answer`);
  }
  if (
    question.format === 'ORDERING' &&
    (!question.orderingItems || question.expectedAnswer.kind !== 'ORDER')
  ) {
    issues.push(`${question.id}: invalid ordering data`);
  }
  if (
    question.format === 'MATCHING' &&
    (!question.matchingPairs || question.expectedAnswer.kind !== 'MATCHES')
  ) {
    issues.push(`${question.id}: invalid matching data`);
  }
  if (question.visual && !question.visual.alt.trim())
    issues.push(`${question.id}: invalid visual description`);
  if (question.visual?.type === 'FRACTION_BAR' || question.visual?.type === 'FRACTION_CIRCLE') {
    const visualFraction = {
      numerator: question.visual.shadedParts,
      denominator: question.visual.equalParts,
    };
    if (
      !Number.isInteger(question.visual.equalParts) ||
      !Number.isInteger(question.visual.shadedParts) ||
      question.visual.equalParts < 2 ||
      question.visual.shadedParts < 0 ||
      question.visual.shadedParts > question.visual.equalParts
    ) {
      issues.push(`${question.id}: invalid fraction visual`);
    } else {
      const expectedFraction = expectedVisualFraction(question);
      if (
        expectedFraction &&
        (visualFraction.numerator !== expectedFraction.numerator ||
          visualFraction.denominator !== expectedFraction.denominator)
      ) {
        issues.push(`${question.id}: fraction visual contradicts expected answer`);
      }
      if (question.expectedAnswer.kind === 'BOOLEAN') {
        const claims = [...question.stem.matchAll(/(\d+)\s*\/\s*(\d+)/g)];
        const claim = claims.at(-1);
        const claimMatchesVisual = claim
          ? sameFraction(visualFraction, {
              numerator: Number(claim[1]),
              denominator: Number(claim[2]),
            })
          : false;
        if (claimMatchesVisual !== question.expectedAnswer.value) {
          issues.push(`${question.id}: fraction visual contradicts true-false answer`);
        }
      }
    }
  }
  const placeValueIssue = findAmbiguousPlaceValueReference(question);
  if (placeValueIssue) issues.push(placeValueIssue);
  return issues;
}

export function validateContent(): string[] {
  const issues = [
    ...duplicates(domains.map((item) => item.id)).map((id) => `duplicate domain id: ${id}`),
    ...duplicates(topics.map((item) => item.id)).map((id) => `duplicate topic id: ${id}`),
    ...duplicates(skills.map((item) => item.id)).map((id) => `duplicate skill id: ${id}`),
    ...duplicates(problemBlueprints.map((item) => item.id)).map(
      (id) => `duplicate problem type id: ${id}`,
    ),
    ...duplicates(questionBank.map((item) => item.id)).map((id) => `duplicate question id: ${id}`),
    ...duplicates(questionBank.map((item) => item.stem)).map(
      (stem) => `duplicate question stem: ${stem}`,
    ),
  ];
  for (const topic of topics) {
    if (!domains.some((domain) => domain.id === topic.domainId))
      issues.push(`${topic.id}: missing domain`);
  }
  for (const skill of skills) {
    if (!topics.some((topic) => topic.id === skill.topicId))
      issues.push(`${skill.id}: missing topic`);
  }
  for (const problemType of problemBlueprints) {
    if (!skills.some((skill) => skill.id === `${problemType.id}-skill`))
      issues.push(`${problemType.id}: missing skill`);
    if (!questionBank.some((question) => question.problemTypeId === problemType.id))
      issues.push(`${problemType.id}: no questions`);
  }
  return [...issues, ...questionBank.flatMap(validateQuestionContent)];
}

export function getContentStats(): ContentStats {
  const byFormat: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  for (const question of questionBank) {
    byFormat[question.format] = (byFormat[question.format] ?? 0) + 1;
    byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] ?? 0) + 1;
  }
  const visualQuestions = questionBank.filter((question) => question.visual).length;
  const coverageGaps = problemBlueprints
    .filter(
      (problemType) =>
        questionBank.filter((question) => question.problemTypeId === problemType.id).length < 3,
    )
    .map((problemType) => problemType.id);
  return {
    domains: domains.length,
    topics: topics.length,
    skills: skills.length,
    problemTypes: problemBlueprints.length,
    questions: questionBank.length,
    byFormat,
    byDifficulty,
    visualQuestions,
    visualPercentage: Number(((visualQuestions / questionBank.length) * 100).toFixed(1)),
    reviewedQuestions: questionBank.filter((question) => question.status === 'REVIEWED').length,
    coverageGaps,
  };
}
