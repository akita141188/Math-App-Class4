export type LearningState =
  | 'PROBLEM_RECEIVED'
  | 'OCR_CONFIRMATION'
  | 'QUESTION_PRESENTED'
  | 'UNDERSTAND_DATA'
  | 'UNDERSTAND_QUESTION'
  | 'UNDERSTAND'
  | 'STRATEGY'
  | 'ATTEMPT'
  | 'CHECKING'
  | 'ERROR_DIAGNOSIS'
  | 'INCORRECT'
  | 'HINT'
  | 'FOUNDATION_REVIEW'
  | 'RETRY'
  | 'SOLVED'
  | 'CORRECT'
  | 'EXPLANATION'
  | 'TRANSFER_TEST'
  | 'COMPLETE';

export interface DemoProblem {
  id: string;
  grade: 4;
  topic: string;
  statement: string;
  question: string;
  hints: string[];
}

export interface CheckAnswerRequest {
  problemId: string;
  answer: string;
}

export interface CheckAnswerResponse {
  correct: boolean;
  feedback: string;
  nextState: LearningState;
}
