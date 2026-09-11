import type {
  PracticeHistoryRecord,
  StoredQuestionResult,
  TestHistoryRecord,
} from '@math-app/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  learningHistoryStorageKey,
  localLearningHistoryRepository,
} from './learningHistoryRepository';

function result(index: number, correct = true): StoredQuestionResult {
  return {
    questionId: `q-${index}`,
    leafTypeId: 'leaf-a',
    topicId: 'topic-a',
    difficulty: 'MEDIUM',
    format: 'SHORT_ANSWER',
    correct,
    unanswered: false,
    hintCount: 0,
    answeredAt: `2026-09-11T10:${String(index).padStart(2, '0')}:00.000Z`,
    questionSummary: `Câu ${index}`,
  };
}

function practice(
  id: string,
  completedAt: string,
  results: StoredQuestionResult[],
): PracticeHistoryRecord {
  return {
    id,
    sessionType: 'PRACTICE',
    practiceMode: 'PRACTICE',
    startedAt: '2026-09-11T10:00:00.000Z',
    completedAt,
    durationSeconds: 300,
    contentVersion: 'grade4-v3',
    selectedDomainIds: ['domain-a'],
    selectedTopicIds: ['topic-a'],
    selectedLeafTypeIds: ['leaf-a'],
    difficultyMode: 'ALL',
    requestedQuestionCount: results.length,
    actualQuestionCount: results.length,
    correctCount: results.filter((item) => item.correct).length,
    incorrectCount: results.filter((item) => !item.correct).length,
    unansweredCount: results.filter((item) => item.unanswered).length,
    accuracyPercent: 80,
    questionResults: results,
  };
}

beforeEach(() => window.localStorage.clear());

describe('learning history repository', () => {
  it('persists completed practice with timestamp and sorts newest first after reload', () => {
    localLearningHistoryRepository.save(practice('old', '2026-09-10T10:00:00.000Z', [result(1)]));
    localLearningHistoryRepository.save(
      practice('new', '2026-09-11T10:00:00.000Z', [result(2, false)]),
    );
    expect(localLearningHistoryRepository.list().map((item) => item.id)).toEqual(['new', 'old']);
    expect(localLearningHistoryRepository.get('new')).toMatchObject({
      correctCount: 0,
      incorrectCount: 1,
      unansweredCount: 0,
    });
  });

  it('distinguishes practice and test and rejects invalid stored data', () => {
    const test = {
      id: 'test-1',
      sessionType: 'TEST',
      testBlueprintId: 'bp',
      testTitle: 'Đề',
      startedAt: '2026-09-11T09:00:00.000Z',
      submittedAt: '2026-09-11T10:00:00.000Z',
      durationSeconds: 3600,
      contentVersion: 'grade4-v3',
      questionCount: 1,
      correctCount: 1,
      incorrectCount: 0,
      unansweredCount: 0,
      rawPercent: 100,
      finalScore10: 10,
      topicBreakdown: [],
      questionResults: [result(1)],
    } satisfies TestHistoryRecord;
    localLearningHistoryRepository.save(test);
    expect(localLearningHistoryRepository.list('TEST')).toHaveLength(1);
    expect(localLearningHistoryRepository.list('PRACTICE')).toHaveLength(0);
    window.localStorage.setItem(learningHistoryStorageKey, '{bad');
    expect(localLearningHistoryRepository.list()).toEqual([]);
  });

  it('enforces the retention limit', () => {
    for (let index = 0; index < 205; index += 1)
      localLearningHistoryRepository.save(
        practice(`p-${index}`, new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(), [
          result(index),
        ]),
      );
    expect(localLearningHistoryRepository.list()).toHaveLength(200);
  });

  it('marks completion after repeated independent work and preserves completedAt on review decline', () => {
    localLearningHistoryRepository.save(
      practice(
        'p1',
        '2026-09-10T10:00:00.000Z',
        Array.from({ length: 10 }, (_, index) => result(index)),
      ),
    );
    localLearningHistoryRepository.save(
      practice(
        'p2',
        '2026-09-11T10:00:00.000Z',
        Array.from({ length: 10 }, (_, index) => result(index + 10)),
      ),
    );
    const completed = localLearningHistoryRepository.getCompletion('leaf-a');
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBeDefined();
    const firstCompletedAt = completed.completedAt;
    localLearningHistoryRepository.save(
      practice(
        'p3',
        '2026-09-12T10:00:00.000Z',
        Array.from({ length: 10 }, (_, index) => result(index + 20, false)),
      ),
    );
    expect(localLearningHistoryRepository.getCompletion('leaf-a')).toMatchObject({
      status: 'NEEDS_REVIEW',
      completedAt: firstCompletedAt,
    });
  });
});
