import type { StudentAnswer, TestAttempt } from '@math-app/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { studentQuestion } from '../test/fixtures';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';
import { TestAttemptPage } from './TestAttemptPage';

const questions = [
  studentQuestion('test-q1', 'Tính 3 × 4.'),
  studentQuestion('test-q2', 'Tính 5 × 6.'),
];
let attempt: TestAttempt;

function renderAttempt() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/tests/attempt/test-1']}>
        <Routes>
          <Route path={'/tests/attempt/:attemptId'} element={<TestAttemptPage />} />
          <Route
            path={'/tests/attempt/:attemptId/review'}
            element={<TestAttemptPage reviewMode />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  attempt = {
    id: 'test-1',
    blueprintId: 'comprehensive',
    title: 'Kiểm tra tổng hợp',
    status: 'IN_PROGRESS',
    contentVersion: 'grade4-v3',
    startedAt: '2026-09-11T10:00:00.000Z',
    questions,
    answers: {},
  };
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (init?.method === 'PUT') {
        const body = JSON.parse(typeof init.body === 'string' ? init.body : '') as {
          answer: StudentAnswer;
        };
        const questionId = url.split('/').at(-1)!;
        attempt = { ...attempt, answers: { ...attempt.answers, [questionId]: body.answer } };
      }
      if (url.endsWith('/submit')) {
        attempt = {
          ...attempt,
          status: 'SUBMITTED',
          submittedAt: '2026-09-11T10:05:00.000Z',
          result: {
            rawCorrect: 1,
            rawIncorrect: 0,
            rawUnanswered: 1,
            rawPoints: 1,
            possiblePoints: 2,
            rawPercent: 50,
            finalScore10: 5,
            durationSeconds: 300,
            topicBreakdown: [{ topicId: 'multiplication', correctCount: 1, questionCount: 2 }],
            questionResults: [
              {
                questionId: 'test-q1',
                topicId: 'multiplication',
                problemTypeId: 'multiply-one-digit',
                assessmentLevel: 'LEVEL_2',
                correct: true,
                unanswered: false,
                pointsEarned: 1,
                pointsPossible: 1,
                studentAnswer: '12',
                correctAnswerSummary: '12',
                explanation: '3 × 4 = 12.',
              },
              {
                questionId: 'test-q2',
                topicId: 'multiplication',
                problemTypeId: 'multiply-one-digit',
                assessmentLevel: 'LEVEL_2',
                correct: false,
                unanswered: true,
                pointsEarned: 0,
                pointsPossible: 1,
                correctAnswerSummary: '30',
                explanation: '5 × 6 = 30.',
              },
            ],
          },
        };
      }
      return Promise.resolve(
        new Response(JSON.stringify(attempt), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('TestAttemptPage', () => {
  it('hides hints and correctness, permits answer edits, then saves and reveals result after submit', async () => {
    const user = userEvent.setup();
    renderAttempt();
    const input = await screen.findByLabelText('Đáp án của em');
    expect(screen.getByRole('complementary', { name: 'Tiến trình bài kiểm tra' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Gợi ý/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Đáp án đúng: 12')).not.toBeInTheDocument();
    await user.type(input, '13');
    await user.clear(input);
    await user.type(input, '12');
    await user.click(screen.getByRole('button', { name: /Câu tiếp theo/i }));
    expect(await screen.findByText('Tính 5 × 6.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Nộp bài' }));
    expect(await screen.findByRole('heading', { name: 'Điểm: 5/10' })).toBeVisible();
    await waitFor(() => expect(localLearningHistoryRepository.list('TEST')).toHaveLength(1));
    await user.click(screen.getByRole('link', { name: 'Xem lại bài' }));
    expect(await screen.findByText('Đáp án đúng: 12')).toBeVisible();
    expect(screen.getByLabelText('Đáp án của em')).toBeDisabled();
  });
});
