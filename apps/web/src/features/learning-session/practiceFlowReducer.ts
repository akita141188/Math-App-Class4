export type PracticeFlowStatus =
  | 'QUESTION_PRESENTED'
  | 'ATTEMPT'
  | 'CHECKING'
  | 'INCORRECT'
  | 'HINT'
  | 'CORRECT'
  | 'EXPLANATION'
  | 'TRANSFER_TEST'
  | 'COMPLETE';

export interface PracticeFlowState {
  status: PracticeFlowStatus;
  hintLevel: number;
}

export type PracticeFlowAction =
  | { type: 'BEGIN_ATTEMPT' }
  | { type: 'SUBMIT' }
  | { type: 'ANSWER_RESULT'; correct: boolean; completed: boolean }
  | { type: 'SHOW_HINT'; maximum: number }
  | { type: 'SHOW_EXPLANATION' }
  | { type: 'NEXT_QUESTION'; transfer: boolean };

export const initialPracticeFlow: PracticeFlowState = {
  status: 'QUESTION_PRESENTED',
  hintLevel: 0,
};

export function practiceFlowReducer(
  state: PracticeFlowState,
  action: PracticeFlowAction,
): PracticeFlowState {
  switch (action.type) {
    case 'BEGIN_ATTEMPT':
      return { ...state, status: 'ATTEMPT' };
    case 'SUBMIT':
      return { ...state, status: 'CHECKING' };
    case 'ANSWER_RESULT':
      return {
        ...state,
        status: action.correct ? (action.completed ? 'COMPLETE' : 'CORRECT') : 'INCORRECT',
      };
    case 'SHOW_HINT':
      return {
        status: 'HINT',
        hintLevel: Math.min(action.maximum, state.hintLevel + 1),
      };
    case 'SHOW_EXPLANATION':
      return { ...state, status: 'EXPLANATION' };
    case 'NEXT_QUESTION':
      return {
        status: action.transfer ? 'TRANSFER_TEST' : 'QUESTION_PRESENTED',
        hintLevel: 0,
      };
  }
}
