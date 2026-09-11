import type { Question } from '@math-app/shared';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GRADE4_CONTENT_VERSION } from './catalog.v2.data';
import type { BankManifest } from './generation/bank-builder';
import { validateQuestionSchema } from './question-schema';

export const GRADE4_BANK_DIRECTORY = join(__dirname, 'banks', 'grade-4', 'v3');

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(
      `Cannot read canonical content bank ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function assertManifest(value: unknown): asserts value is BankManifest {
  if (!value || typeof value !== 'object') throw new Error('Bank manifest must be an object.');
  const manifest = value as Partial<BankManifest>;
  if (
    manifest.grade !== 4 ||
    manifest.contentVersion !== GRADE4_CONTENT_VERSION ||
    !Array.isArray(manifest.problemTypes)
  ) {
    throw new Error(`Bank manifest is invalid or is not ${GRADE4_CONTENT_VERSION}.`);
  }
}

function assertQuestionShape(
  value: unknown,
  file: string,
  index: number,
): asserts value is Question {
  const schemaIssues = validateQuestionSchema(value);
  if (schemaIssues.length > 0)
    throw new Error(`${file}[${index}] failed schema validation: ${schemaIssues.join('; ')}`);
  if (!value || typeof value !== 'object') throw new Error(`${file}[${index}] is not an object.`);
  const question = value as Partial<Question>;
  const requiredStrings: Array<keyof Question> = [
    'id',
    'contentVersion',
    'templateId',
    'fingerprint',
    'domainId',
    'topicId',
    'skillId',
    'problemTypeId',
    'format',
    'difficulty',
    'stem',
    'explanation',
    'status',
  ];
  for (const key of requiredStrings) {
    if (typeof question[key] !== 'string' || String(question[key]).trim() === '')
      throw new Error(`${file}[${index}].${String(key)} is invalid.`);
  }
  if (
    question.grade !== 4 ||
    question.version !== 2 ||
    question.contentVersion !== GRADE4_CONTENT_VERSION
  )
    throw new Error(`${file}[${index}] has an invalid grade/content version.`);
  if (!question.expectedAnswer || typeof question.expectedAnswer !== 'object')
    throw new Error(`${file}[${index}] has no expected answer.`);
  if (!question.generatorParams || typeof question.generatorParams !== 'object')
    throw new Error(`${file}[${index}] has no generator parameters.`);
  if (!Array.isArray(question.hints) || question.hints.length !== 3)
    throw new Error(`${file}[${index}] must contain exactly three hints.`);
  if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 2)
    throw new Error(`${file}[${index}] has invalid solution steps.`);
}

export function loadCanonicalGrade4Bank(directory = GRADE4_BANK_DIRECTORY) {
  const manifestPath = join(directory, 'manifest.json');
  if (!existsSync(manifestPath))
    throw new Error(
      `Canonical Grade 4 bank is missing. Run "pnpm content:build-bank" first. Expected ${manifestPath}`,
    );
  const manifestValue = readJson(manifestPath);
  assertManifest(manifestValue);
  const questions: Question[] = [];
  for (const entry of manifestValue.problemTypes) {
    const path = join(directory, entry.file);
    const shard = readJson(path);
    if (!Array.isArray(shard)) throw new Error(`${entry.file} must contain a JSON array.`);
    if (shard.length !== entry.questionCount)
      throw new Error(
        `${entry.file} contains ${shard.length} questions; manifest declares ${entry.questionCount}.`,
      );
    shard.forEach((question, index) => {
      assertQuestionShape(question, entry.file, index);
      if (question.problemTypeId !== entry.problemTypeId)
        throw new Error(`${entry.file}[${index}] points to ${question.problemTypeId}.`);
      questions.push(question);
    });
  }
  return { manifest: manifestValue, questions };
}
