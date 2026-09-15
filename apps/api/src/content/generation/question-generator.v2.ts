import type {
  AssessmentLevel,
  CommonError,
  Difficulty,
  ExpectedAnswer,
  Question,
  QuestionFormat,
} from '@math-app/shared';
import type { ProblemBlueprint } from '../catalog.data';
import { misconceptionCodeForFamily } from '../catalog.data';
import { GRADE4_CONTENT_VERSION, GRADE4_GENERATION_SEED } from '../catalog.v2.data';
import { generateAppliedCore } from './applied-generators';
import { generateArithmeticCore } from './arithmetic-generators';
import { fisherYates, stableHash } from './content-math';
import { generateFractionCore } from './fraction-generators';
import type { GeneratedCore } from './generator-types';
import { generateKnttCore } from './kntt-generators';
import { generateQualityOverride } from './quality-overrides';
import { applySemanticTemplate } from './semantic-template';

function difficultyFor(index: number): Difficulty {
  return index < 30 ? 'EASY' : index < 80 ? 'MEDIUM' : 'HARD';
}

/**
 * Assessment level is independent from UI difficulty.
 * The 3/5/2 cycle keeps a healthy LEVEL_1/2/3 distribution inside every difficulty band.
 */
function assessmentLevelFor(index: number): AssessmentLevel {
  const slot = index % 10;
  return slot < 3 ? 'LEVEL_1' : slot < 8 ? 'LEVEL_2' : 'LEVEL_3';
}

function formatFor(core: GeneratedCore, index: number): QuestionFormat {
  if (core.expectedAnswer.kind === 'ORDER') return 'ORDERING';
  return (
    ['SHORT_ANSWER', 'FILL_BLANK', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'WRITTEN_SOLUTION'] as const
  )[index % 5]!;
}

function commonErrorFor(blueprint: ProblemBlueprint): CommonError {
  const feedbackByFamily: Partial<Record<ProblemBlueprint['family'], string>> = {
    PLACE_VALUE: 'Em xác định lại đúng lớp và hàng của mỗi chữ số nhé.',
    FRACTION: 'Em kiểm tra lại tử số, mẫu số và phép tính với phân số nhé.',
    DIVIDE: 'Em dùng phép nhân để kiểm tra thương và số dư nhé.',
    LENGTH: 'Em đổi các đại lượng về cùng một đơn vị trước nhé.',
    MASS: 'Em kiểm tra lại quan hệ giữa hai đơn vị khối lượng nhé.',
    UNIT_CONVERSION: 'Em kiểm tra hệ số đổi đơn vị, đặc biệt với diện tích nhé.',
    CLOCK: 'Em nhớ mỗi số trên mặt đồng hồ ứng với 5 phút nhé.',
    DURATION: 'Em đổi thời gian về cùng một đơn vị rồi tính nhé.',
    PERIMETER: 'Em kiểm tra xem đề hỏi chu vi hay diện tích nhé.',
    AREA: 'Em kiểm tra công thức và đơn vị diện tích nhé.',
    DATA: 'Em đọc lại đúng giá trị từng cột hoặc từng hàng nhé.',
  };
  return {
    code: misconceptionCodeForFamily(blueprint.family),
    feedback:
      feedbackByFamily[blueprint.family] ??
      'Em đọc lại dữ kiện, chọn đúng phép tính rồi kiểm tra kết quả nhé.',
  };
}

function makeOptions(core: GeneratedCore, seed: string) {
  const labels = [core.answerLabel, ...core.distractors]
    .filter((label) => label.trim().length > 0)
    .filter((label, index, all) => all.indexOf(label) === index)
    .slice(0, 4);
  while (labels.length < 4) labels.push(`Cần tính lại ${labels.length}`);
  const ordered = fisherYates(
    labels,
    (() => {
      let cursor = Number.parseInt(stableHash(seed, 8), 16) >>> 0;
      return () => {
        cursor = (Math.imul(cursor, 1_664_525) + 1_013_904_223) >>> 0;
        return cursor / 4_294_967_296;
      };
    })(),
  );
  const options = ordered.map((label, index) => ({ id: `option-${index + 1}`, label }));
  return {
    options,
    correctOptionId: options.find((option) => option.label === core.answerLabel)!.id,
  };
}

function falseClaim(core: GeneratedCore): string {
  return core.distractors.find((value) => value !== core.answerLabel) ?? `khác ${core.answerLabel}`;
}

export function generateQuestion(blueprint: ProblemBlueprint, index: number): Question {
  const rawCore =
    generateQualityOverride(blueprint, index) ??
    generateKnttCore(blueprint, index) ??
    generateArithmeticCore(blueprint, index) ??
    generateFractionCore(blueprint, index) ??
    generateAppliedCore(blueprint, index);
  if (!rawCore) throw new Error(`Missing v3 generator for ${blueprint.id}`);
  const core = applySemanticTemplate(blueprint, rawCore, index % 5);
  const format = formatFor(core, index);
  const baseIdentity = {
    grade: 4,
    contentVersion: GRADE4_CONTENT_VERSION,
    generationSeed: GRADE4_GENERATION_SEED,
    problemTypeId: blueprint.id,
    templateId: core.templateId,
    params: core.params,
  };
  const id = `g4-${blueprint.id}-${stableHash(baseIdentity, 16)}`;
  let stem = core.stem;
  let expectedAnswer: ExpectedAnswer = core.expectedAnswer;
  let options: Question['options'];
  let orderingItems: Question['orderingItems'];

  if (format === 'MULTIPLE_CHOICE') {
    const built = makeOptions(core, id);
    options = built.options;
    expectedAnswer = { kind: 'OPTION', optionId: built.correctOptionId };
  } else if (format === 'TRUE_FALSE') {
    const claimIsCorrect = Math.floor(index / 5) % 2 === 0;
    const claim = claimIsCorrect ? core.answerLabel : falseClaim(core);
    stem = `${core.stem} Bạn An cho rằng đáp án là ${claim}. Bạn An nói đúng hay sai?`;
    expectedAnswer = { kind: 'BOOLEAN', value: claimIsCorrect };
  } else if (format === 'ORDERING') {
    const base = Number(core.params.base);
    const ascending = Boolean(core.params.ascending);
    const values = [base + 71, base - 13, base + 8, base + 102];
    orderingItems = values.map((value, itemIndex) => ({
      id: `n${itemIndex + 1}`,
      label: value.toLocaleString('vi-VN'),
    }));
    const sorted = [...orderingItems].sort((left, right) => {
      const a = Number(left.label.replace(/\D/g, ''));
      const b = Number(right.label.replace(/\D/g, ''));
      return ascending ? a - b : b - a;
    });
    expectedAnswer = { kind: 'ORDER', itemIds: sorted.map((item) => item.id) };
  }

  const fingerprintPayload = {
    problemTypeId: blueprint.id,
    templateId: core.templateId,
    params: core.params,
    stem: stem.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi'),
    expectedAnswer,
    visual: core.visual ?? null,
    options: options ?? null,
  };
  const fingerprint = stableHash(fingerprintPayload, 32);
  return {
    id,
    contentVersion: GRADE4_CONTENT_VERSION,
    templateId: core.templateId,
    fingerprint,
    generatorParams: core.params,
    grade: 4,
    domainId: blueprint.domainId,
    topicId: blueprint.topicId,
    skillId: `${blueprint.id}-skill`,
    problemTypeId: blueprint.id,
    format,
    difficulty: difficultyFor(index),
    assessmentLevel: assessmentLevelFor(index),
    testEligible: true,
    scoreWeight: 1,
    stem,
    visual: core.visual,
    options,
    orderingItems,
    expectedAnswer,
    solutionSteps: [
      { id: 'understand', instruction: core.hints[0] },
      { id: 'strategy', instruction: core.hints[1] },
      { id: 'check', instruction: core.hints[2] },
    ],
    hints: core.hints.map((text, hintIndex) => ({ level: hintIndex + 1, text })),
    commonErrors: [commonErrorFor(blueprint)],
    prerequisiteSkillIds: [],
    explanation: core.explanation,
    status: 'REVIEWED',
    version: 2,
  };
}
