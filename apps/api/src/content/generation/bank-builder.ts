import type { Question } from '@math-app/shared';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  finalizedProblemBlueprints,
  GRADE4_CONTENT_VERSION,
  GRADE4_GENERATION_SEED,
  QUESTIONS_PER_PROBLEM_TYPE,
} from '../catalog.v2.data';
import { generateQuestion } from './question-generator.v2';

export interface BankManifestEntry {
  problemTypeId: string;
  file: string;
  questionCount: number;
  easy: number;
  medium: number;
  hard: number;
  templates: number;
}

export interface BankManifest {
  grade: 4;
  contentVersion: string;
  generationSeed: string;
  generatedAt: string;
  problemTypes: BankManifestEntry[];
}

export interface MaterializedBank {
  manifest: BankManifest;
  shards: Map<string, Question[]>;
}

export function buildBankInMemory(generatedAt = new Date().toISOString()): MaterializedBank {
  const shards = new Map<string, Question[]>();
  const problemTypes = finalizedProblemBlueprints.map((blueprint) => {
    const questions = Array.from({ length: QUESTIONS_PER_PROBLEM_TYPE }, (_, index) =>
      generateQuestion(blueprint, index),
    );
    shards.set(blueprint.id, questions);
    return {
      problemTypeId: blueprint.id,
      file: `${blueprint.id}.json`,
      questionCount: questions.length,
      easy: questions.filter((question) => question.difficulty === 'EASY').length,
      medium: questions.filter((question) => question.difficulty === 'MEDIUM').length,
      hard: questions.filter((question) => question.difficulty === 'HARD').length,
      templates: new Set(questions.map((question) => question.templateId)).size,
    };
  });
  return {
    manifest: {
      grade: 4,
      contentVersion: GRADE4_CONTENT_VERSION,
      generationSeed: GRADE4_GENERATION_SEED,
      generatedAt,
      problemTypes,
    },
    shards,
  };
}

export function materializeBank(rootDirectory: string): BankManifest {
  const bank = buildBankInMemory();
  mkdirSync(rootDirectory, { recursive: true });
  for (const entry of bank.manifest.problemTypes) {
    const questions = bank.shards.get(entry.problemTypeId);
    if (!questions) throw new Error(`Missing generated shard ${entry.problemTypeId}`);
    writeFileSync(
      join(rootDirectory, entry.file),
      `${JSON.stringify(questions, null, 2)}\n`,
      'utf8',
    );
  }
  writeFileSync(
    join(rootDirectory, 'manifest.json'),
    `${JSON.stringify(bank.manifest, null, 2)}\n`,
    'utf8',
  );
  return bank.manifest;
}
