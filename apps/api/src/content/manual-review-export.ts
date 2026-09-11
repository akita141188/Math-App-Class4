import type { Difficulty, Question } from '@math-app/shared';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { finalizedProblemBlueprints } from './catalog.v2.data';

function answer(question: Question): string {
  const value = question.expectedAnswer;
  if (value.kind === 'NUMBER') return `${value.value}${value.unit ? ` ${value.unit}` : ''}`;
  if (value.kind === 'FRACTION') return `${value.numerator}/${value.denominator}`;
  if (value.kind === 'TEXT') return value.accepted.join(' | ');
  if (value.kind === 'OPTION')
    return (
      question.options?.find((option) => option.id === value.optionId)?.label ?? value.optionId
    );
  if (value.kind === 'OPTIONS') return value.optionIds.join(', ');
  if (value.kind === 'BOOLEAN') return value.value ? 'Đúng' : 'Sai';
  if (value.kind === 'ORDER') return value.itemIds.join(' → ');
  return value.pairs.map((pair) => `${pair.leftId} → ${pair.rightId}`).join(', ');
}

export function exportManualReviewWorksheet(
  questions: readonly Question[],
  outputPath: string,
): number {
  const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
  const lines = [
    '# Phiếu kiểm duyệt đại diện Grade 4 v2',
    '',
    'Mỗi problem type gồm 5 EASY + 5 MEDIUM + 5 HARD. Người kiểm duyệt phải đánh dấu từng mục; việc sinh phiếu không đồng nghĩa đã kiểm duyệt.',
    '',
  ];
  let count = 0;
  for (const type of finalizedProblemBlueprints) {
    lines.push(`## ${type.name} (${type.id})`, '');
    for (const difficulty of difficulties) {
      lines.push(`### ${difficulty}`, '');
      const sample = questions
        .filter(
          (question) => question.problemTypeId === type.id && question.difficulty === difficulty,
        )
        .slice(0, 5);
      for (const question of sample) {
        count += 1;
        lines.push(
          `- [ ] **${question.id}** — ${question.templateId} — ${question.format}`,
          `  - Đề: ${question.stem}`,
          `  - Đáp án: ${answer(question)}`,
          `  - Hints: ${question.hints.map((hint) => hint.text).join(' / ')}`,
          `  - Giải thích: ${question.explanation}`,
          `  - Visual: ${question.visual ? JSON.stringify(question.visual) : 'không'}`,
          '  - Kết quả kiểm duyệt: CHƯA KIỂM DUYỆ',
          '',
        );
      }
    }
  }
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  return count;
}
