import type { Question } from '@math-app/shared';

function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

function validateExpected(value: unknown): string[] {
  if (!object(value) || !nonEmptyString(value.kind))
    return ['expectedAnswer must be a tagged object'];
  switch (value.kind) {
    case 'NUMBER':
      return typeof value.value === 'number' && Number.isFinite(value.value)
        ? []
        : ['NUMBER answer value is invalid'];
    case 'FRACTION':
      return integer(value.numerator) && integer(value.denominator) && value.denominator > 0
        ? []
        : ['FRACTION answer is invalid'];
    case 'TEXT':
      return Array.isArray(value.accepted) &&
        value.accepted.length > 0 &&
        value.accepted.every(nonEmptyString)
        ? []
        : ['TEXT answer accepted list is invalid'];
    case 'OPTION':
      return nonEmptyString(value.optionId) ? [] : ['OPTION answer id is invalid'];
    case 'OPTIONS':
      return Array.isArray(value.optionIds) &&
        value.optionIds.length > 0 &&
        value.optionIds.every(nonEmptyString)
        ? []
        : ['OPTIONS answer ids are invalid'];
    case 'BOOLEAN':
      return typeof value.value === 'boolean' ? [] : ['BOOLEAN answer value is invalid'];
    case 'ORDER':
      return Array.isArray(value.itemIds) &&
        value.itemIds.length > 1 &&
        value.itemIds.every(nonEmptyString)
        ? []
        : ['ORDER answer ids are invalid'];
    case 'MATCHES':
      return Array.isArray(value.pairs) &&
        value.pairs.length > 0 &&
        value.pairs.every(
          (pair) => object(pair) && nonEmptyString(pair.leftId) && nonEmptyString(pair.rightId),
        )
        ? []
        : ['MATCHES answer pairs are invalid'];
    default:
      return [`Unknown expectedAnswer kind ${String(value.kind)}`];
  }
}

function validateVisual(value: unknown): string[] {
  if (value === undefined) return [];
  if (!object(value) || !nonEmptyString(value.type) || !nonEmptyString(value.alt))
    return ['visual must have type and alt'];
  switch (value.type) {
    case 'FRACTION_BAR':
    case 'FRACTION_CIRCLE':
      return integer(value.equalParts) && integer(value.shadedParts)
        ? []
        : ['fraction visual counts must be integers'];
    case 'SHAPE':
      return ['SQUARE', 'RECTANGLE', 'TRIANGLE', 'CIRCLE'].includes(String(value.shape))
        ? []
        : ['shape visual is invalid'];
    case 'ANGLE':
      return typeof value.degrees === 'number' && value.degrees > 0 && value.degrees < 180
        ? []
        : ['angle visual is invalid'];
    case 'LINE_RELATION':
      return ['PARALLEL', 'PERPENDICULAR'].includes(String(value.relation))
        ? []
        : ['line relation visual is invalid'];
    case 'QUADRILATERAL':
      return ['PARALLELOGRAM', 'RHOMBUS'].includes(String(value.shape))
        ? []
        : ['quadrilateral visual is invalid'];
    case 'RECTANGLE_GRID':
      return integer(value.rows) && integer(value.columns) && integer(value.shaded)
        ? []
        : ['rectangle grid is invalid'];
    case 'NUMBER_LINE':
      return typeof value.start === 'number' &&
        typeof value.end === 'number' &&
        typeof value.marker === 'number'
        ? []
        : ['number line is invalid'];
    case 'CLOCK':
      return integer(value.hour) && integer(value.minute) ? [] : ['clock is invalid'];
    case 'RULER':
      return typeof value.lengthCm === 'number' ? [] : ['ruler is invalid'];
    case 'MONEY':
      return Array.isArray(value.notes) && value.notes.every((note) => integer(note) && note > 0)
        ? []
        : ['money notes are invalid'];
    case 'BAR_CHART':
      return Array.isArray(value.bars) &&
        value.bars.every(
          (bar) => object(bar) && nonEmptyString(bar.label) && typeof bar.value === 'number',
        )
        ? []
        : ['bar chart is invalid'];
    case 'TABLE':
      return Array.isArray(value.headers) &&
        value.headers.every(nonEmptyString) &&
        Array.isArray(value.rows) &&
        value.rows.every((row) => Array.isArray(row) && row.every(nonEmptyString))
        ? []
        : ['table is invalid'];
    case 'OBJECT_GROUPS':
      return integer(value.groups) && integer(value.itemsPerGroup)
        ? []
        : ['object groups are invalid'];
    case 'GEOMETRY_DIAGRAM':
      return ['RECTANGLE', 'SQUARE'].includes(String(value.shape)) &&
        typeof value.width === 'number' &&
        typeof value.height === 'number' &&
        nonEmptyString(value.unit)
        ? []
        : ['geometry diagram is invalid'];
    default:
      return [`Unknown visual type ${String(value.type)}`];
  }
}

export function validateQuestionSchema(value: unknown): string[] {
  if (!object(value)) return ['question must be an object'];
  const issues: string[] = [];
  for (const key of [
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
  ])
    if (!nonEmptyString(value[key])) issues.push(`${key} must be a non-empty string`);
  if (value.grade !== 4) issues.push('grade must equal 4');
  if (value.version !== 2) issues.push('version must equal 2');
  if (!['LEVEL_1', 'LEVEL_2', 'LEVEL_3'].includes(String(value.assessmentLevel)))
    issues.push('assessmentLevel is invalid');
  if (typeof value.testEligible !== 'boolean') issues.push('testEligible must be boolean');
  if (typeof value.scoreWeight !== 'number' || value.scoreWeight <= 0)
    issues.push('scoreWeight must be positive');
  if (!object(value.generatorParams)) issues.push('generatorParams must be an object');
  if (
    !Array.isArray(value.hints) ||
    value.hints.length !== 3 ||
    !value.hints.every((hint) => object(hint) && integer(hint.level) && nonEmptyString(hint.text))
  )
    issues.push('hints must contain three valid entries');
  if (!Array.isArray(value.solutionSteps) || value.solutionSteps.length < 2)
    issues.push('solutionSteps must contain at least two entries');
  if (!Array.isArray(value.commonErrors) || value.commonErrors.length < 1)
    issues.push('commonErrors must not be empty');
  if (
    !Array.isArray(value.prerequisiteSkillIds) ||
    !value.prerequisiteSkillIds.every(nonEmptyString)
  )
    issues.push('prerequisiteSkillIds is invalid');
  issues.push(...validateExpected(value.expectedAnswer), ...validateVisual(value.visual));
  if (
    value.format === 'MULTIPLE_CHOICE' &&
    (!Array.isArray(value.options) || value.options.length !== 4)
  )
    issues.push('MULTIPLE_CHOICE requires four options');
  if (value.format === 'ORDERING' && !Array.isArray(value.orderingItems))
    issues.push('ORDERING requires orderingItems');
  if (value.format === 'MATCHING' && !Array.isArray(value.matchingPairs))
    issues.push('MATCHING requires matchingPairs');
  return issues;
}

export function isQuestion(value: unknown): value is Question {
  return validateQuestionSchema(value).length === 0;
}
