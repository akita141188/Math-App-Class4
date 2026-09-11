import type { ExpectedAnswer, Question } from '@math-app/shared';

export function expectedAnswerSummary(question: Question): string {
  const answer: ExpectedAnswer = question.expectedAnswer;
  switch (answer.kind) {
    case 'NUMBER':
      return `${answer.value}${answer.unit ? ` ${answer.unit}` : ''}`;
    case 'FRACTION':
      return `${answer.numerator}/${answer.denominator}`;
    case 'TEXT':
      return answer.accepted[0] ?? '';
    case 'OPTION':
      return (
        question.options?.find((option) => option.id === answer.optionId)?.label ?? answer.optionId
      );
    case 'OPTIONS':
      return answer.optionIds
        .map((id) => question.options?.find((option) => option.id === id)?.label ?? id)
        .join(', ');
    case 'BOOLEAN':
      return answer.value ? 'Đúng' : 'Sai';
    case 'ORDER':
      return answer.itemIds
        .map((id) => question.orderingItems?.find((item) => item.id === id)?.label ?? id)
        .join(' → ');
    case 'MATCHES':
      return answer.pairs.map((pair) => `${pair.leftId} → ${pair.rightId}`).join(', ');
  }
}
