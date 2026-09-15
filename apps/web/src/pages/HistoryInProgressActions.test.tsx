import type { InProgressSessionDraft } from '@math-app/shared';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { historyFileRepository } from '../features/progress/historyFileRepository';
import { HistoryPage } from './HistoryPage';

const draft: InProgressSessionDraft = {
  id: 'draft-actions-test',
  sessionType: 'TEST',
  title: 'Cuối học kỳ I',
  startedAt: '2026-09-15T08:00:00.000Z',
  savedAt: '2026-09-15T08:05:00.000Z',
  resumePath: '/tests/attempt/draft-actions-test',
  currentIndex: 3,
  totalQuestions: 20,
  answeredCount: 4,
  testBlueprintId: 'end-term-1',
  answers: {},
  questions: [],
  questionStates: {},
};

beforeEach(() => {
  historyFileRepository.resetForTests();
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            version: 1,
            updatedAt: draft.savedAt,
            records: [],
            inProgress: [draft],
            completions: [],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    ),
  );
  historyFileRepository.optimisticSaveDraft(draft);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('unfinished History actions', () => {
  it('shows only Continue and Delete for unfinished sessions, not a redundant Review button', () => {
    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Làm tiếp/i })).toHaveAttribute(
      'href',
      '/tests/attempt/draft-actions-test',
    );

    expect(screen.queryByRole('link', { name: 'Xem lại' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa bài đang làm dở/i })).toBeVisible();
  });
});
