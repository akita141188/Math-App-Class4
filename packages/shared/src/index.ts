export type LearningState =
  | 'UNDERSTAND_DATA'
  | 'UNDERSTAND_QUESTION'
  | 'STRATEGY'
  | 'ATTEMPT'
  | 'ERROR_DIAGNOSIS'
  | 'HINT'
  | 'FOUNDATION_REVIEW'
  | 'RETRY'
  | 'SOLVED'
  | 'TRANSFER_TEST'
  | 'COMPLETE';

export interface CurriculumTopic {
  id: string;
  name: string;
  skill: string;
}

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
