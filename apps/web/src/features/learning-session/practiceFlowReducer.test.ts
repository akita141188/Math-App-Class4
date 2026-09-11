import { describe, expect, it } from 'vitest';
import { initialPracticeFlow, practiceFlowReducer } from './practiceFlowReducer';

describe('practiceFlowReducer', () => {
  it('moves through attempt, checking and incorrect without revealing an answer', () => {
    const attempted = practiceFlowReducer(initialPracticeFlow, { type: 'BEGIN_ATTEMPT' });
    const checking = practiceFlowReducer(attempted, { type: 'SUBMIT' });
    const incorrect = practiceFlowReducer(checking, {
      type: 'ANSWER_RESULT',
      correct: false,
      completed: false,
    });
    expect([attempted.status, checking.status, incorrect.status]).toEqual([
      'ATTEMPT',
      'CHECKING',
      'INCORRECT',
    ]);
  });

  it('keeps hints progressive and bounded', () => {
    const first = practiceFlowReducer(initialPracticeFlow, { type: 'SHOW_HINT', maximum: 3 });
    const second = practiceFlowReducer(first, { type: 'SHOW_HINT', maximum: 3 });
    const fourthAttempt = practiceFlowReducer(
      practiceFlowReducer(second, { type: 'SHOW_HINT', maximum: 3 }),
      { type: 'SHOW_HINT', maximum: 3 },
    );
    expect(fourthAttempt).toEqual({ status: 'HINT', hintLevel: 3 });
  });

  it('uses transfer and complete as explicit states', () => {
    const correct = practiceFlowReducer(initialPracticeFlow, {
      type: 'ANSWER_RESULT',
      correct: true,
      completed: false,
    });
    const transfer = practiceFlowReducer(correct, { type: 'NEXT_QUESTION', transfer: true });
    const complete = practiceFlowReducer(transfer, {
      type: 'ANSWER_RESULT',
      correct: true,
      completed: true,
    });
    expect([correct.status, transfer.status, complete.status]).toEqual([
      'CORRECT',
      'TRANSFER_TEST',
      'COMPLETE',
    ]);
  });
});
