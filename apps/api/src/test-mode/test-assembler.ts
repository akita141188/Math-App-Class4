import type { AssessmentLevel, Question, QuestionFormat, TestBlueprint } from '@math-app/shared';
import { fisherYates } from '../content/generation/content-math';

const LEVELS: AssessmentLevel[] = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3'];

interface Quotas {
  levels: Record<AssessmentLevel, number>;
  formats: Partial<Record<QuestionFormat, number>>;
}

function remainingTotal(values: Record<string, number | undefined>): number {
  return Object.values(values).reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function matrixValue(matrix: readonly number[][], row: number, column: number): number {
  return matrix[row]?.[column] ?? 0;
}

function setMatrixValue(matrix: number[][], row: number, column: number, value: number): void {
  const targetRow = matrix[row];
  if (!targetRow) throw new Error(`Invalid flow-matrix row ${row}.`);
  targetRow[column] = value;
}

function quotaPlan(
  candidates: readonly Question[],
  usedIds: ReadonlySet<string>,
  usedFingerprints: ReadonlySet<string>,
  quotas: Quotas,
): Map<string, number> | null {
  const formats = (Object.entries(quotas.formats) as Array<[QuestionFormat, number | undefined]>)
    .filter((entry): entry is [QuestionFormat, number] => (entry[1] ?? 0) > 0)
    .map(([format]) => format);

  const requiredByLevel = LEVELS.map((level) => Math.max(0, quotas.levels[level] ?? 0));
  const requiredByFormat = formats.map((format) => Math.max(0, quotas.formats[format] ?? 0));
  const total = requiredByLevel.reduce<number>((sum, value) => sum + value, 0);

  if (total !== requiredByFormat.reduce<number>((sum, value) => sum + value, 0)) return null;
  if (total === 0) return new Map();

  // Tiny max-flow graph:
  // source -> 3 assessment levels -> configured formats -> sink.
  const source = 0;
  const levelOffset = 1;
  const formatOffset = levelOffset + LEVELS.length;
  const sink = formatOffset + formats.length;
  const nodeCount = sink + 1;
  const capacity: number[][] = Array.from({ length: nodeCount }, () =>
    Array<number>(nodeCount).fill(0),
  );

  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
    setMatrixValue(capacity, source, levelOffset + levelIndex, requiredByLevel[levelIndex] ?? 0);
  }
  for (let formatIndex = 0; formatIndex < formats.length; formatIndex += 1) {
    setMatrixValue(capacity, formatOffset + formatIndex, sink, requiredByFormat[formatIndex] ?? 0);
  }

  const available = new Map<string, number>();
  for (const question of candidates) {
    if (usedIds.has(question.id) || usedFingerprints.has(question.fingerprint)) continue;
    if (!formats.includes(question.format)) continue;
    if (!LEVELS.includes(question.assessmentLevel)) continue;
    const key = `${question.assessmentLevel}|${question.format}`;
    available.set(key, (available.get(key) ?? 0) + 1);
  }

  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
    for (let formatIndex = 0; formatIndex < formats.length; formatIndex += 1) {
      const key = `${LEVELS[levelIndex]}|${formats[formatIndex]}`;
      setMatrixValue(
        capacity,
        levelOffset + levelIndex,
        formatOffset + formatIndex,
        available.get(key) ?? 0,
      );
    }
  }

  const residual = capacity.map((row) => [...row]);
  let flow = 0;

  while (flow < total) {
    const parent: number[] = Array<number>(nodeCount).fill(-1);
    parent[source] = source;
    const queue: number[] = [source];

    for (let cursor = 0; cursor < queue.length && (parent[sink] ?? -1) < 0; cursor += 1) {
      const node = queue[cursor];
      if (node === undefined) break;
      for (let next = 0; next < nodeCount; next += 1) {
        if ((parent[next] ?? -1) >= 0 || matrixValue(residual, node, next) <= 0) continue;
        parent[next] = node;
        queue.push(next);
        if (next === sink) break;
      }
    }

    if ((parent[sink] ?? -1) < 0) return null;

    let augment = Number.POSITIVE_INFINITY;
    for (let node = sink; node !== source;) {
      const prior = parent[node];
      if (prior === undefined || prior < 0) return null;
      augment = Math.min(augment, matrixValue(residual, prior, node));
      node = prior;
    }

    for (let node = sink; node !== source;) {
      const prior = parent[node];
      if (prior === undefined || prior < 0) return null;
      setMatrixValue(residual, prior, node, matrixValue(residual, prior, node) - augment);
      setMatrixValue(residual, node, prior, matrixValue(residual, node, prior) + augment);
      node = prior;
    }
    flow += augment;
  }

  const plan = new Map<string, number>();
  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
    for (let formatIndex = 0; formatIndex < formats.length; formatIndex += 1) {
      const from = levelOffset + levelIndex;
      const to = formatOffset + formatIndex;
      const used = matrixValue(capacity, from, to) - matrixValue(residual, from, to);
      if (used > 0) plan.set(`${LEVELS[levelIndex]}|${formats[formatIndex]}`, used);
    }
  }
  return plan;
}

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
  // Keep unseen questions ahead of recycled questions while retaining seeded randomness.
  const candidates = [...unseen, ...seen];

  const quotas: Quotas = {
    levels: { ...blueprint.assessmentLevelDistribution },
    formats: { ...blueprint.formatDistribution },
  };
  const selected: Question[] = [];
  const usedIds = new Set<string>();
  const usedFingerprints = new Set<string>();

  const choose = (question: Question): void => {
    selected.push(question);
    usedIds.add(question.id);
    usedFingerprints.add(question.fingerprint);
    quotas.levels[question.assessmentLevel] -= 1;
    quotas.formats[question.format] = (quotas.formats[question.format] ?? 0) - 1;
  };

  const unchoose = (question: Question): void => {
    selected.pop();
    usedIds.delete(question.id);
    usedFingerprints.delete(question.fingerprint);
    quotas.levels[question.assessmentLevel] += 1;
    quotas.formats[question.format] = (quotas.formats[question.format] ?? 0) + 1;
  };

  // Cover every requested topic first. Try only one representative per
  // level/format combination for a topic. After each tentative choice,
  // max-flow proves that the remaining global quotas are still satisfiable.
  const topics = [...blueprint.topicCoverage].sort((left, right) => {
    const leftCount = candidates.filter((question) => question.topicId === left).length;
    const rightCount = candidates.filter((question) => question.topicId === right).length;
    return leftCount - rightCount;
  });

  const coverTopic = (topicIndex: number): boolean => {
    if (topicIndex >= topics.length) {
      return quotaPlan(candidates, usedIds, usedFingerprints, quotas) !== null;
    }

    const topicId = topics[topicIndex];
    if (!topicId) return false;

    const representatives = new Map<string, Question>();
    for (const question of candidates) {
      if (question.topicId !== topicId) continue;
      if (usedIds.has(question.id) || usedFingerprints.has(question.fingerprint)) continue;
      if ((quotas.levels[question.assessmentLevel] ?? 0) <= 0) continue;
      if ((quotas.formats[question.format] ?? 0) <= 0) continue;
      const key = `${question.assessmentLevel}|${question.format}`;
      if (!representatives.has(key)) representatives.set(key, question);
    }

    const options = [...representatives.values()].sort((left, right) => {
      const leftScore =
        (quotas.levels[left.assessmentLevel] ?? 0) + (quotas.formats[left.format] ?? 0);
      const rightScore =
        (quotas.levels[right.assessmentLevel] ?? 0) + (quotas.formats[right.format] ?? 0);
      return rightScore - leftScore;
    });

    for (const question of options) {
      choose(question);
      const feasible = quotaPlan(candidates, usedIds, usedFingerprints, quotas) !== null;
      if (feasible && coverTopic(topicIndex + 1)) return true;
      unchoose(question);
    }
    return false;
  };

  if (!coverTopic(0)) {
    throw new Error('Blueprint cannot satisfy topic coverage with level/format constraints.');
  }

  const plan = quotaPlan(candidates, usedIds, usedFingerprints, quotas);
  if (!plan) throw new Error('Not enough eligible questions to satisfy blueprint constraints.');

  for (const [key, count] of plan) {
    const separator = key.indexOf('|');
    const level = key.slice(0, separator) as AssessmentLevel;
    const format = key.slice(separator + 1);
    let remaining = count;

    for (const question of candidates) {
      if (remaining <= 0) break;
      if (question.assessmentLevel !== level || question.format !== format) continue;
      if (usedIds.has(question.id) || usedFingerprints.has(question.fingerprint)) continue;
      choose(question);
      remaining -= 1;
    }

    if (remaining > 0) {
      throw new Error(`Not enough eligible questions for ${level}/${format} after planning.`);
    }
  }

  if (selected.length !== blueprint.questionCount) {
    throw new Error(
      `Blueprint assembled ${selected.length} questions; expected ${blueprint.questionCount}.`,
    );
  }

  if (remainingTotal(quotas.levels) !== 0 || remainingTotal(quotas.formats) !== 0) {
    throw new Error('Blueprint distribution was not satisfied.');
  }

  return fisherYates(selected, rng);
}
