import { describe, expect, it } from 'vitest';
import {
  buildPracticeQuestionStates,
  buildTestQuestionStates,
  countDraftQuestionStates,
  snapshotDraftQuestions,
} from './sessionDraftSnapshot';

const questions = [
  {
    id: 'q1',
    stem: 'Câu 1',
    problemTypeId: 'leaf-a',
    topicId: 'topic-a',
    difficulty: 'EASY' as const,
    assessmentLevel: 'LEVEL_1' as const,
    format: 'SHORT_ANSWER' as const,
  },
  {
    id: 'q2',
    stem: 'Câu 2',
    problemTypeId: 'leaf-a',
    topicId: 'topic-a',
    difficulty: 'MEDIUM' as const,
    assessmentLevel: 'LEVEL_2' as const,
    format: 'SHORT_ANSWER' as const,
  },
  {
    id: 'q3',
    stem: 'Câu 3',
    problemTypeId: 'leaf-a',
    topicId: 'topic-a',
    difficulty: 'HARD' as const,
    assessmentLevel: 'LEVEL_3' as const,
    format: 'SHORT_ANSWER' as const,
  },
  {
    id: 'q4',
    stem: 'Câu 4',
    problemTypeId: 'leaf-a',
    topicId: 'topic-a',
    difficulty: 'EASY' as const,
    assessmentLevel: 'LEVEL_1' as const,
    format: 'SHORT_ANSWER' as const,
  },
];

describe('session draft snapshot', () => {
  it('remembers correct, wrong, working and untouched practice questions', () => {
    const states = buildPracticeQuestionStates(
      questions,
      2,
      { q3: '123' },
      new Set(['q1']),
      new Set(['q1', 'q2']),
    );

    expect(states).toEqual({
      q1: 'CORRECT',
      q2: 'WRONG',
      q3: 'WORKING',
      q4: 'UNANSWERED',
    });
    expect(countDraftQuestionStates(states)).toMatchObject({
      correct: 1,
      wrong: 1,
      working: 1,
      unanswered: 1,
    });
  });

  it('does not reveal correctness for an unfinished test', () => {
    const states = buildTestQuestionStates(questions, 1, { q1: '12', q2: '30' });

    expect(states).toEqual({
      q1: 'ANSWERED',
      q2: 'WORKING',
      q3: 'UNANSWERED',
      q4: 'UNANSWERED',
    });
  });

  it('stores enough question metadata to review a draft without the live API session', () => {
    expect(snapshotDraftQuestions(questions)[0]).toEqual({
      questionId: 'q1',
      questionSummary: 'Câu 1',
      leafTypeId: 'leaf-a',
      topicId: 'topic-a',
      difficulty: 'EASY',
      assessmentLevel: 'LEVEL_1',
      format: 'SHORT_ANSWER',
    });
  });
});
