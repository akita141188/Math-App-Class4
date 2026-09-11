import type { ExpectedAnswer, QuestionVisual } from '@math-app/shared';
import type { GeneratorParam } from './content-math';

export interface GeneratedCore {
  templateId: string;
  params: Record<string, GeneratorParam>;
  stem: string;
  expectedAnswer: ExpectedAnswer;
  answerLabel: string;
  distractors: string[];
  hints: [string, string, string];
  explanation: string;
  visual?: QuestionVisual;
  answerUnit?: string;
}
