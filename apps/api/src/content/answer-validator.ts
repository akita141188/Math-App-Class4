import type {
  AnswerResult,
  ExpectedAnswer,
  FractionAnswer,
  Question,
  StudentAnswer,
} from '@math-app/shared';

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('vi')
    .normalize('NFC')
    .replace(/[.,\s]/g, '')
    .trim();
}

function sameSet(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    [...left].sort().every((value, index) => value === [...right].sort()[index])
  );
}

function isFractionAnswer(answer: StudentAnswer): answer is FractionAnswer {
  if (typeof answer !== 'object' || Array.isArray(answer) || answer === null) return false;
  const candidate = answer as Partial<FractionAnswer>;
  return (
    candidate.kind === 'FRACTION' &&
    typeof candidate.numerator === 'number' &&
    typeof candidate.denominator === 'number'
  );
}

function isStringRecord(answer: StudentAnswer): answer is Record<string, string> {
  return (
    typeof answer === 'object' &&
    !Array.isArray(answer) &&
    answer !== null &&
    !isFractionAnswer(answer)
  );
}

function parseFraction(answer: StudentAnswer): { numerator: number; denominator: number } | null {
  if (
    isFractionAnswer(answer) &&
    Number.isInteger(answer.numerator) &&
    Number.isInteger(answer.denominator) &&
    answer.denominator > 0
  ) {
    return { numerator: answer.numerator, denominator: answer.denominator };
  }
  if (isStringRecord(answer) && typeof answer.final === 'string') {
    return parseFraction(answer.final);
  }
  if (typeof answer !== 'string') return null;
  const match = answer.trim().match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0)
    return null;
  return { numerator, denominator };
}

function validateExpected(expected: ExpectedAnswer, answer: StudentAnswer): boolean {
  switch (expected.kind) {
    case 'NUMBER': {
      const submitted =
        typeof answer === 'string' ? answer : isStringRecord(answer) ? (answer.final ?? '') : '';
      const normalizedExpected = normalizeText(String(expected.value));
      const numbers = submitted.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
      return numbers.some((value) => normalizeText(value) === normalizedExpected);
    }
    case 'FRACTION': {
      const submitted = parseFraction(answer);
      if (!submitted) return false;
      if (expected.requireExactForm) {
        return (
          submitted.numerator === expected.numerator &&
          submitted.denominator === expected.denominator
        );
      }
      return (
        submitted.numerator * expected.denominator === expected.numerator * submitted.denominator
      );
    }
    case 'TEXT': {
      const submitted =
        typeof answer === 'string' ? answer : isStringRecord(answer) ? (answer.final ?? '') : '';
      return expected.accepted.some((value) => normalizeText(value) === normalizeText(submitted));
    }
    case 'OPTION':
      return typeof answer === 'string' && answer === expected.optionId;
    case 'OPTIONS':
      return Array.isArray(answer) && sameSet(answer, expected.optionIds);
    case 'BOOLEAN':
      return typeof answer === 'boolean' && answer === expected.value;
    case 'ORDER':
      return (
        Array.isArray(answer) && answer.every((value, index) => value === expected.itemIds[index])
      );
    case 'MATCHES':
      return (
        isStringRecord(answer) &&
        expected.pairs.every((pair) => answer[pair.leftId] === pair.rightId)
      );
  }
}

export function validateStudentAnswer(question: Question, answer: StudentAnswer): AnswerResult {
  const correct = validateExpected(question.expectedAnswer, answer);
  if (correct) {
    return {
      correct: true,
      feedback: 'Chính xác! Em đã tự tìm được đáp án.',
      explanation: question.explanation,
    };
  }

  const commonError = question.commonErrors[0];
  return {
    correct: false,
    feedback: commonError?.feedback ?? 'Mình kiểm tra lại dữ kiện và phép tính nhé.',
    misconception: commonError?.code,
  };
}
