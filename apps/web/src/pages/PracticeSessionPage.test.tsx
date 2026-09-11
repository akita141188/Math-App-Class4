import type {
  PracticeSession,
  SubmitPracticeAnswerRequest,
  SubmitPracticeAnswerResponse,
} from '@math-app/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { studentQuestion } from '../test/fixtures';
import { PracticeSessionPage } from './PracticeSessionPage';

const questions = [
  studentQuestion('question-1', 'Tính 14 × 3.'),
  studentQuestion('question-2', 'Tính 3 × 4.'),
];

const session: PracticeSession = {
  id: 'practice-test',
  selectedGrade: 4,
  selectedProblemTypes: ['multiply-one-digit'],
  selectedTopicIds: ['multiplication'],
  mode: 'LEARN',
  questionCount: 2,
  requestedQuestionCount: 2,
  availableQuestionCount: 40,
  contentVersion: 'grade4-v3',
  startedAt: '2026-09-11T12:00:00.000Z',
  currentQuestionIndex: 0,
  correctCount: 0,
  hintUsage: 0,
  attempts: [],
  mistakes: [],
  completed: false,
  questions,
};

beforeEach(() => window.localStorage.clear());

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PracticeSessionPage', () => {
  it('shows progressive hints, retries a wrong answer, completes, and persists progress', async () => {
    const submissions: SubmitPracticeAnswerRequest[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (!url.endsWith('/answer')) {
          return Promise.resolve(
            new Response(JSON.stringify(session), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }
        if (typeof init?.body !== 'string') {
          throw new TypeError('Expected a serialized JSON request body.');
        }
        const submission = JSON.parse(init.body) as SubmitPracticeAnswerRequest;
        submissions.push(submission);
        const firstQuestion = submission.questionId === 'question-1';
        const correct = submission.answer === (firstQuestion ? '42' : '12');
        const response: SubmitPracticeAnswerResponse = {
          result: correct
            ? { correct: true, feedback: 'Chính xác!' }
            : {
                correct: false,
                feedback: 'Em kiểm tra lại phép nhân nhé.',
                misconception: 'ARITHMETIC_SLIP',
              },
          currentQuestionIndex: firstQuestion && correct ? 1 : correct ? 2 : 0,
          correctCount: firstQuestion && correct ? 1 : correct ? 2 : 0,
          completed: !firstQuestion && correct,
        };
        return Promise.resolve(
          new Response(JSON.stringify(response), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter
          initialEntries={['/practice?types=multiply-one-digit&difficulty=EASY&mode=LEARN&count=2']}
        >
          <PracticeSessionPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Tính 14 × 3.' })).toBeVisible();
    expect(screen.getByRole('complementary', { name: 'Tiến trình luyện tập' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Gợi ý từng bước/i }));
    await user.click(screen.getByRole('button', { name: /Gợi ý từng bước/i }));
    expect(screen.getByText('Xác định hai thừa số.')).toBeVisible();
    expect(screen.getByText('Nhân từ hàng đơn vị.')).toBeVisible();

    const input = screen.getByLabelText('Đáp án của em');
    await user.type(input, '41');
    await user.click(screen.getByRole('button', { name: /Kiểm tra/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Em kiểm tra lại phép nhân nhé.');
    expect(submissions[0]).toEqual({ questionId: 'question-1', answer: '41', hintCount: 2 });

    await user.clear(input);
    await user.type(input, '42');
    await user.click(screen.getByRole('button', { name: /Kiểm tra/i }));
    expect(await screen.findByText('Chính xác!')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Câu tiếp theo/i }));

    expect(screen.getByRole('heading', { name: 'Tính 3 × 4.' })).toBeVisible();
    await user.type(screen.getByLabelText('Đáp án của em'), '12');
    await user.click(screen.getByRole('button', { name: /Kiểm tra/i }));
    expect(await screen.findByRole('heading', { name: /đi hết bộ câu hỏi/i })).toBeVisible();

    const saved = JSON.parse(
      window.localStorage.getItem('math-app-class4-progress-v1') ?? '{}',
    ) as { totalQuestions?: number; independentCorrect?: number; hintedCorrect?: number };
    expect(saved).toMatchObject({ totalQuestions: 3, independentCorrect: 1, hintedCorrect: 1 });
  });
});
