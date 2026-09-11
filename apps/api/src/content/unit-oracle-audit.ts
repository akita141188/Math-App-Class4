import type { Question } from '@math-app/shared';
import type { ContentIssue } from './content-quality.v2';

const unitPatterns: Array<{ pattern: RegExp; unit: string }> = [
  { pattern: /bao nhiêu cm²/i, unit: 'cm²' },
  { pattern: /bao nhiêu dm²/i, unit: 'dm²' },
  { pattern: /bao nhiêu mm²/i, unit: 'mm²' },
  { pattern: /bao nhiêu xăng-ti-mét vuông/i, unit: 'cm²' },
  { pattern: /bao nhiêu đề-xi-mét vuông/i, unit: 'dm²' },
  { pattern: /bao nhiêu mét vuông/i, unit: 'm²' },
  { pattern: /bao nhiêu xăng-ti-mét|bao nhiêu cm/i, unit: 'cm' },
  { pattern: /bao nhiêu mi-li-mét|bao nhiêu mm/i, unit: 'mm' },
  { pattern: /bao nhiêu phút/i, unit: 'phút' },
  { pattern: /bao nhiêu giây/i, unit: 'giây' },
  { pattern: /bao nhiêu đồng/i, unit: 'đồng' },
  { pattern: /bao nhiêu quyển/i, unit: 'quyển' },
  { pattern: /bao nhiêu cây/i, unit: 'cây' },
];

export function auditQuestionUnits(question: Question): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const expected = question.expectedAnswer;
  if (expected.kind === 'NUMBER') {
    const detected = unitPatterns.find((item) => item.pattern.test(question.stem));
    if (detected && expected.unit !== detected.unit)
      issues.push({
        code: 'UNIT_ERROR',
        questionId: question.id,
        message: `Stem asks for ${detected.unit}, expected answer declares ${expected.unit ?? 'no unit'}.`,
      });
  }
  if (question.visual?.type === 'GEOMETRY_DIAGRAM') {
    const width = Number(question.generatorParams.width ?? question.generatorParams.side);
    const height = Number(question.generatorParams.height ?? question.generatorParams.side);
    if (
      (Number.isFinite(width) && question.visual.width !== width) ||
      (Number.isFinite(height) && question.visual.height !== height)
    )
      issues.push({
        code: 'VISUAL_MISMATCH',
        questionId: question.id,
        message: 'Geometry visual labels differ from oracle parameters.',
      });
  }
  if (question.visual?.type === 'BAR_CHART') {
    const parameterValues = ['a', 'b', 'c', 'd']
      .map((key) => question.generatorParams[key])
      .filter((value): value is number => typeof value === 'number');
    if (
      parameterValues.length > 0 &&
      parameterValues.some(
        (value, index) =>
          question.visual?.type !== 'BAR_CHART' || question.visual.bars[index]?.value !== value,
      )
    )
      issues.push({
        code: 'VISUAL_MISMATCH',
        questionId: question.id,
        message: 'Bar values differ from oracle parameters.',
      });
  }
  return issues;
}
