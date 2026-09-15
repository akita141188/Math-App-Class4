import type { TestHistoryRecord } from '@math-app/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { historyFileRepository } from '../features/progress/historyFileRepository';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';
import { HistoryDetailPage } from './HistoryDetailPage';
import { HistoryPage } from './HistoryPage';

const testRecord: TestHistoryRecord = {
  id: 'history-test-1',
  sessionType: 'TEST',
  testBlueprintId: 'comprehensive',
  testTitle: 'Kiểm tra tổng hợp',
  startedAt: '2026-09-11T10:00:00.000Z',
  submittedAt: '2026-09-11T10:10:00.000Z',
  durationSeconds: 600,
  contentVersion: 'grade4-v3',
  questionCount: 1,
  correctCount: 1,
  incorrectCount: 0,
  unansweredCount: 0,
  rawPercent: 100,
  finalScore10: 10,
  topicBreakdown: [{ topicId: 'multiplication', correctCount: 1, questionCount: 1 }],
  questionResults: [
    {
      questionId: 'q-1',
      leafTypeId: 'multiply-one-digit',
      topicId: 'multiplication',
      difficulty: 'MEDIUM',
      assessmentLevel: 'LEVEL_2',
      format: 'SHORT_ANSWER',
      correct: true,
      unanswered: false,
      hintCount: 0,
      answeredAt: '2026-09-11T10:10:00.000Z',
      studentAnswer: '12',
      correctAnswerSummary: '12',
      questionSummary: 'Tính 3 × 4.',
      explanation: '3 × 4 = 12.',
    },
  ],
};

beforeEach(() => {
  historyFileRepository.resetForTests();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Response(
          JSON.stringify({
            version: 1,
            updatedAt: new Date().toISOString(),
            records: historyFileRepository.getSnapshot().records,
            inProgress: historyFileRepository.getSnapshot().inProgress,
            completions: historyFileRepository.getSnapshot().completions,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    ),
  );
  localLearningHistoryRepository.save(testRecord);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('history pages', () => {
  it('displays saved test history and its post-submission review detail', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/history']}>
        <Routes>
          <Route path={'/history'} element={<HistoryPage />} />
          <Route path={'/history/:historyId'} element={<HistoryDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Kiểm tra tổng hợp' })).toBeVisible();
    expect(screen.getByText('10/10')).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Xem chi tiết' }));
    await user.click(await screen.findByText('Câu 1 — Đúng'));
    expect(await screen.findByText('Tính 3 × 4.')).toBeVisible();
    expect(screen.getByText('Đáp án đúng:').parentElement).toHaveTextContent('12');
  });
});
