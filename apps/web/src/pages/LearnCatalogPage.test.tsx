import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { catalogFixture } from '../test/fixtures';
import { LearnCatalogPage } from './LearnCatalogPage';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

function renderCatalog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/learn/types']}>
        <Routes>
          <Route path={'/learn/types'} element={<LearnCatalogPage allTypes />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LearnCatalogPage', () => {
  function stubCatalog() {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve(
          new Response(JSON.stringify(catalogFixture), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      ),
    );
  }

  it('shows child-friendly progress for each problem type', async () => {
    window.localStorage.setItem(
      'math-app-class4-progress-v1',
      JSON.stringify({
        totalQuestions: 2,
        independentCorrect: 0,
        hintedCorrect: 0,
        skills: [
          {
            skillId: 'multiply-one-digit-skill',
            attempts: 2,
            correct: 0,
            incorrect: 2,
            independentCorrect: 0,
            hintedCorrect: 0,
            lastPracticedAt: '2026-09-11T00:00:00.000Z',
            recentMistakes: ['MULTIPLICATION_FACT_GAP'],
            masteryLevel: 'NEEDS_REVIEW',
          },
        ],
      }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve(
          new Response(JSON.stringify(catalogFixture), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      ),
    );

    renderCatalog();

    expect(await screen.findByText('Cần ôn lại')).toBeVisible();
    expect(screen.getAllByText('Chưa học')).toHaveLength(2);
    expect(screen.queryByText('NEEDS_REVIEW')).not.toBeInTheDocument();
  });

  it('filters the type catalog and creates a multi-type practice URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve(
          new Response(JSON.stringify(catalogFixture), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      ),
    );
    const user = userEvent.setup();
    renderCatalog();

    const multiply = await screen.findByRole('button', { name: /Nhân với số có một chữ số/i });
    const groups = screen.getByRole('button', { name: /Nhiều nhóm bằng nhau/i });
    await user.click(multiply);
    await user.click(groups);

    expect(screen.getByRole('heading', { name: '2 dạng đã chọn' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Luyện các dạng đã chọn/i })).toHaveAttribute(
      'href',
      expect.stringContaining('types=multiply-one-digit,equal-groups'),
    );

    await user.selectOptions(screen.getByLabelText('Lọc theo chủ đề'), 'units');
    expect(screen.getByText('Đổi đơn vị độ dài')).toBeVisible();
    expect(screen.queryByText('Nhiều nhóm bằng nhau')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Lọc theo chủ đề'), '');
    await user.type(screen.getByLabelText('Tìm dạng Toán'), 'đổi đơn vị');
    expect(screen.getByText('Đổi đơn vị độ dài')).toBeVisible();
    expect(screen.queryByText('Nhân với số có một chữ số')).not.toBeInTheDocument();
  });

  it('presents the all-types catalog with the illustrated desktop hero', async () => {
    stubCatalog();
    const { container } = renderCatalog();

    expect(await screen.findByRole('heading', { name: 'Chọn dạng em muốn luyện' })).toBeVisible();
    expect(container.querySelector('.catalog-hero-art')).toHaveAttribute(
      'src',
      '/assets/redesign/catalog-hero-wide.webp',
    );
    expect(container.querySelector('.problem-type-illustration img')).toHaveAttribute(
      'src',
      '/assets/redesign/topic-numbers.webp',
    );
  });

  it('selects and deselects every visible leaf, with a partial state', async () => {
    stubCatalog();
    const user = userEvent.setup();
    renderCatalog();
    const selectAll = await screen.findByLabelText('Chọn tất cả kết quả đang hiển thị');
    await user.click(selectAll);
    expect(screen.getByRole('heading', { name: '3 dạng đã chọn' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Nhân với số có một chữ số/i }));
    expect(selectAll).toHaveProperty('indeterminate', true);
    expect(screen.getByRole('heading', { name: '2 dạng đã chọn' })).toBeVisible();
    await user.click(selectAll);
    expect(screen.getByRole('heading', { name: '3 dạng đã chọn' })).toBeVisible();
    await user.click(selectAll);
    expect(screen.getByRole('heading', { name: '0 dạng đã chọn' })).toBeVisible();
  });

  it('shows a readable disabled question-count placeholder before a type is selected', async () => {
    stubCatalog();
    renderCatalog();

    const count = await screen.findByLabelText('Số câu');
    expect(count).toBeDisabled();
    expect(count).toHaveValue('');
    expect(count).toHaveTextContent('Chưa có câu phù hợp');
  });

  it('limits count options to the eligible pool and select-all respects filtering', async () => {
    stubCatalog();
    const user = userEvent.setup();
    renderCatalog();
    await user.selectOptions(await screen.findByLabelText('Lọc theo chủ đề'), 'units');
    await user.click(screen.getByLabelText('Chọn tất cả kết quả đang hiển thị'));
    expect(screen.getByRole('heading', { name: '1 dạng đã chọn' })).toBeVisible();
    expect(screen.getByText('Có 100 câu phù hợp')).toBeVisible();
    const count = screen.getByLabelText('Số câu');
    expect(count).toHaveTextContent('50 câu');
    expect(count).toHaveTextContent('Tất cả (100 câu)');
    await user.selectOptions(screen.getByLabelText('Mức độ'), 'HARD');
    expect(screen.getByText('Có 20 câu phù hợp')).toBeVisible();
    expect(count).toHaveTextContent('Tất cả (20 câu)');
    expect(count).toHaveTextContent('10 câu');
  });
});
