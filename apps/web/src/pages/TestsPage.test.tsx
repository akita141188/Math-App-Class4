import type { TestBlueprint } from '@math-app/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestsPage } from './TestsPage';

const blueprint: TestBlueprint = {
  id: 'comprehensive',
  title: 'Kiểm tra tổng hợp',
  kind: 'COMPREHENSIVE',
  grade: 4,
  description: 'Đề tổng hợp Toán lớp 4.',
  totalScore: 10,
  questionCount: 20,
  sections: [],
  topicCoverage: ['natural-numbers'],
  assessmentLevelDistribution: { LEVEL_1: 6, LEVEL_2: 10, LEVEL_3: 4 },
  formatDistribution: {
    SHORT_ANSWER: 4,
    FILL_BLANK: 4,
    MULTIPLE_CHOICE: 4,
    TRUE_FALSE: 4,
    WRITTEN_SOLUTION: 4,
  },
};

vi.mock('../api/client', () => ({
  getTestBlueprints: () => Promise.resolve([blueprint]),
  createTestAttempt: vi.fn(),
}));

afterEach(cleanup);

describe('TestsPage', () => {
  it('explains the deterministic scoring method before a student starts', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText('Cách tính điểm: Mỗi câu 0,5 điểm · điểm cuối làm tròn số nguyên'),
    ).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Kiểm tra tổng hợp' })).toBeVisible();
    expect(container.querySelector('.test-card-cover img')).toHaveAttribute(
      'src',
      '/assets/redesign/test-cover-comprehensive.webp',
    );
  });
});
