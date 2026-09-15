import type {
  HistoryFileStore,
  InProgressSessionDraft,
  PracticeSession,
  StudentAnswer,
  SubmitPracticeAnswerRequest,
  SubmitPracticeAnswerResponse,
  TestAttempt,
} from '@math-app/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { historyFileRepository } from '../features/progress/historyFileRepository';
import { HistoryDraftDetailPage } from './HistoryDraftDetailPage';
import { PracticeSessionPage } from './PracticeSessionPage';
import { TestAttemptPage } from './TestAttemptPage';
import { studentQuestion } from '../test/fixtures';

const practiceQuestions = [
  studentQuestion('practice-q1', 'Tính 14 × 3.'),
  studentQuestion('practice-q2', 'Tính 3 × 4.'),
];

const practiceSession: PracticeSession = {
  id: 'practice-draft-regression',
  selectedGrade: 4,
  selectedProblemTypes: ['multiply-one-digit'],
  selectedTopicIds: ['multiplication'],
  mode: 'LEARN',
  questionCount: 2,
  requestedQuestionCount: 2,
  availableQuestionCount: 40,
  contentVersion: 'grade4-v3',
  startedAt: '2026-09-15T08:00:00.000Z',
  currentQuestionIndex: 0,
  correctCount: 0,
  hintUsage: 0,
  attempts: [],
  mistakes: [],
  completed: false,
  questions: practiceQuestions,
};

const testQuestions = [
  studentQuestion('test-draft-q1', 'Tính 7 × 8.'),
  studentQuestion('test-draft-q2', 'Tính 9 × 6.'),
];

function emptyHistoryStore(): HistoryFileStore {
  return {
    version: 1,
    updatedAt: '2026-09-15T08:00:00.000Z',
    records: [],
    inProgress: [],
    completions: [],
  };
}

function historyResponse(store: HistoryFileStore): Response {
  return new Response(JSON.stringify(store), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function saveDraftInStore(
  store: HistoryFileStore,
  draft: InProgressSessionDraft,
): HistoryFileStore {
  return {
    ...store,
    updatedAt: draft.savedAt,
    inProgress: [
      draft,
      ...store.inProgress.filter(
        (item) => !(item.id === draft.id && item.sessionType === draft.sessionType),
      ),
    ],
  };
}

function renderPractice(): void {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter
        initialEntries={['/practice?types=multiply-one-digit&difficulty=EASY&mode=LEARN&count=2']}
      >
        <PracticeSessionPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderTest(attemptId: string): void {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/tests/attempt/${attemptId}`]}>
        <Routes>
          <Route path={'/tests/attempt/:attemptId'} element={<TestAttemptPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  historyFileRepository.resetForTests();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('unfinished session History regression', () => {
  it('keeps the Practice navigator alive and autosaves WRONG + WORKING per question', async () => {
    let historyStore = emptyHistoryStore();

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const method = init?.method ?? 'GET';

        if (url.endsWith('/api/v1/practice-sessions') && method === 'POST') {
          return Promise.resolve(
            new Response(JSON.stringify(practiceSession), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }

        if (url.endsWith('/answer') && method === 'POST') {
          const body = JSON.parse(
            typeof init?.body === 'string' ? init.body : '{}',
          ) as SubmitPracticeAnswerRequest;
          const response: SubmitPracticeAnswerResponse = {
            result: {
              correct: false,
              feedback: 'Em kiểm tra lại phép nhân nhé.',
              misconception: 'ARITHMETIC_SLIP',
            },
            currentQuestionIndex: 0,
            correctCount: 0,
            completed: false,
          };

          expect(body.questionId).toBe('practice-q1');

          return Promise.resolve(
            new Response(JSON.stringify(response), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }

        if (url.includes('/api/v1/history/in-progress/') && method === 'PUT') {
          const draft = JSON.parse(
            typeof init?.body === 'string' ? init.body : '{}',
          ) as InProgressSessionDraft;
          historyStore = saveDraftInStore(historyStore, draft);
          return Promise.resolve(historyResponse(historyStore));
        }

        throw new Error(`Unexpected fetch in Practice draft regression: ${method} ${url}`);
      }),
    );

    const user = userEvent.setup();
    renderPractice();

    expect(await screen.findByRole('heading', { name: 'Tính 14 × 3.' })).toBeVisible();

    // Regression for the V12 crash: solvedCount must still exist and render.
    expect(screen.getByText('0/2 đã hoàn thành')).toBeVisible();

    const input = screen.getByLabelText('Đáp án của em');
    await user.type(input, '41');
    await user.click(screen.getByRole('button', { name: /Kiểm tra/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Em kiểm tra lại phép nhân nhé.');

    await waitFor(() => {
      const draft = historyFileRepository.getSnapshot().inProgress[0];
      expect(draft?.sessionType).toBe('PRACTICE');
      expect(draft?.questionStates).toMatchObject({
        'practice-q1': 'WRONG',
        'practice-q2': 'UNANSWERED',
      });
      expect(draft?.questions).toHaveLength(2);
      if (draft?.sessionType === 'PRACTICE') {
        expect(draft.results[0]).toMatchObject({
          questionId: 'practice-q1',
          correct: false,
          studentAnswer: '41',
        });
      }
    });

    await user.click(screen.getByRole('button', { name: /Câu 2 chưa làm/i }));
    expect(await screen.findByRole('heading', { name: 'Tính 3 × 4.' })).toBeVisible();

    await waitFor(() => {
      const draft = historyFileRepository.getSnapshot().inProgress[0];
      expect(draft?.questionStates).toMatchObject({
        'practice-q1': 'WRONG',
        'practice-q2': 'WORKING',
      });
      expect(draft?.currentIndex).toBe(1);
      expect(draft?.answeredCount).toBe(1);
    });
  });

  it('autosaves Test ANSWERED + WORKING without exposing correctness before submit', async () => {
    let historyStore = emptyHistoryStore();
    let attempt: TestAttempt = {
      id: 'test-draft-regression',
      blueprintId: 'comprehensive',
      title: 'Kiểm tra tổng hợp',
      status: 'IN_PROGRESS',
      contentVersion: 'grade4-v3',
      startedAt: '2026-09-15T08:00:00.000Z',
      questions: testQuestions,
      answers: {},
    };

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const method = init?.method ?? 'GET';

        if (url.endsWith('/api/v1/test-attempts/test-draft-regression') && method === 'GET') {
          return Promise.resolve(
            new Response(JSON.stringify(attempt), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }

        if (
          url.includes('/api/v1/test-attempts/test-draft-regression/answers/') &&
          method === 'PUT'
        ) {
          const questionId = decodeURIComponent(url.split('/').at(-1) ?? '');
          const body = JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as {
            answer: StudentAnswer;
          };
          attempt = {
            ...attempt,
            answers: { ...attempt.answers, [questionId]: body.answer },
          };

          return Promise.resolve(
            new Response(JSON.stringify(attempt), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }

        if (url.includes('/api/v1/history/in-progress/') && method === 'PUT') {
          const draft = JSON.parse(
            typeof init?.body === 'string' ? init.body : '{}',
          ) as InProgressSessionDraft;
          historyStore = saveDraftInStore(historyStore, draft);
          return Promise.resolve(historyResponse(historyStore));
        }

        throw new Error(`Unexpected fetch in Test draft regression: ${method} ${url}`);
      }),
    );

    const user = userEvent.setup();
    renderTest(attempt.id);

    expect(await screen.findByText('Tính 7 × 8.')).toBeVisible();

    await user.type(screen.getByLabelText('Đáp án của em'), '56');
    await user.click(screen.getByRole('button', { name: /Câu tiếp theo/i }));

    expect(await screen.findByText('Tính 9 × 6.')).toBeVisible();

    await waitFor(() => {
      const draft = historyFileRepository.getSnapshot().inProgress[0];
      expect(draft?.sessionType).toBe('TEST');
      expect(draft?.questionStates).toMatchObject({
        'test-draft-q1': 'ANSWERED',
        'test-draft-q2': 'WORKING',
      });
      expect(draft?.questions).toHaveLength(2);
      expect(draft?.answeredCount).toBe(1);
    });

    expect(screen.queryByText(/Đáp án đúng:/i)).not.toBeInTheDocument();
  });

  it('renders saved unfinished Practice states from History without the live session API', async () => {
    const draft: InProgressSessionDraft = {
      id: 'practice-history-detail',
      sessionType: 'PRACTICE',
      title: 'Luyện tập đang làm dở',
      startedAt: '2026-09-15T08:00:00.000Z',
      savedAt: '2026-09-15T08:05:00.000Z',
      resumePath: '/practice?resume=practice-history-detail',
      currentIndex: 2,
      totalQuestions: 4,
      answeredCount: 2,
      practiceMode: 'PRACTICE',
      selectedLeafTypeIds: ['multiply-one-digit'],
      answers: {
        q1: '42',
        q2: '41',
        q3: '12',
      },
      hintLevels: {},
      results: [
        {
          questionId: 'q1',
          leafTypeId: 'multiply-one-digit',
          topicId: 'multiplication',
          difficulty: 'EASY',
          format: 'SHORT_ANSWER',
          correct: true,
          unanswered: false,
          hintCount: 0,
          answeredAt: '2026-09-15T08:02:00.000Z',
          studentAnswer: '42',
          questionSummary: 'Tính 14 × 3.',
        },
        {
          questionId: 'q2',
          leafTypeId: 'multiply-one-digit',
          topicId: 'multiplication',
          difficulty: 'EASY',
          format: 'SHORT_ANSWER',
          correct: false,
          unanswered: false,
          hintCount: 0,
          answeredAt: '2026-09-15T08:03:00.000Z',
          studentAnswer: '41',
          questionSummary: 'Tính 6 × 7.',
        },
      ],
      questions: [
        {
          questionId: 'q1',
          questionSummary: 'Tính 14 × 3.',
          leafTypeId: 'multiply-one-digit',
          topicId: 'multiplication',
          difficulty: 'EASY',
          format: 'SHORT_ANSWER',
        },
        {
          questionId: 'q2',
          questionSummary: 'Tính 6 × 7.',
          leafTypeId: 'multiply-one-digit',
          topicId: 'multiplication',
          difficulty: 'EASY',
          format: 'SHORT_ANSWER',
        },
        {
          questionId: 'q3',
          questionSummary: 'Tính 3 × 4.',
          leafTypeId: 'multiply-one-digit',
          topicId: 'multiplication',
          difficulty: 'EASY',
          format: 'SHORT_ANSWER',
        },
        {
          questionId: 'q4',
          questionSummary: 'Tính 8 × 8.',
          leafTypeId: 'multiply-one-digit',
          topicId: 'multiplication',
          difficulty: 'EASY',
          format: 'SHORT_ANSWER',
        },
      ],
      questionStates: {
        q1: 'CORRECT',
        q2: 'WRONG',
        q3: 'WORKING',
        q4: 'UNANSWERED',
      },
    };

    let historyStore = saveDraftInStore(emptyHistoryStore(), draft);

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const method = init?.method ?? 'GET';

        if (url.includes('/api/v1/history/in-progress/') && method === 'PUT') {
          const saved = JSON.parse(
            typeof init?.body === 'string' ? init.body : '{}',
          ) as InProgressSessionDraft;
          historyStore = saveDraftInStore(historyStore, saved);
          return Promise.resolve(historyResponse(historyStore));
        }

        throw new Error(`Unexpected fetch in History detail regression: ${method} ${url}`);
      }),
    );

    historyFileRepository.optimisticSaveDraft(draft);

    render(
      <MemoryRouter initialEntries={['/history/draft/practice-history-detail']}>
        <Routes>
          <Route path={'/history/draft/:draftId'} element={<HistoryDraftDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    const question1 = await screen.findByText('Câu 1 — Hoàn thành');
    expect(question1).toBeVisible();
    expect(screen.getByText('Câu 2 — Đang sai')).toBeVisible();
    expect(screen.getByText('Câu 3 — Đang làm')).toBeVisible();
    expect(screen.getByText('Câu 4 — Chưa làm')).toBeVisible();

    // Completed/wrong items are intentionally collapsed by <details>.
    // Verify the content exists, stays hidden while collapsed, then becomes visible after opening.
    const question1Content = screen.getByText('Tính 14 × 3.');
    expect(question1Content).not.toBeVisible();

    await user.click(question1);
    expect(question1Content).toBeVisible();

    const question2 = screen.getByText('Câu 2 — Đang sai');
    const question2Details = question2.closest('details');
    expect(question2Details).not.toBeNull();
    expect(question2Details).not.toHaveAttribute('open');

    await user.click(question2);

    expect(question2Details).toHaveAttribute('open');
    expect(within(question2Details!).getByText('Tính 6 × 7.')).toBeVisible();
    expect(within(question2Details!).getByText('41')).toBeVisible();

    // WORKING is deliberately open by default so the learner sees where they left off.
    const question3 = screen.getByText('Câu 3 — Đang làm');
    const question3Details = question3.closest('details');
    expect(question3Details).toHaveAttribute('open');
    expect(within(question3Details!).getByText('Tính 3 × 4.')).toBeVisible();
    expect(within(question3Details!).getByText('12')).toBeVisible();
  });
});
