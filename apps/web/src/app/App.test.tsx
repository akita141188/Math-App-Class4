import type { DemoProblem } from '@math-app/shared';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catalogFixture } from '../test/fixtures';
import { App } from './App';

const demoProblem: DemoProblem = {
  id: 'demo-multiplication-01',
  grade: 4,
  topic: 'Phép nhân với số có một chữ số',
  statement:
    'Một cửa hàng có 245 hộp bánh. Mỗi hộp có 6 chiếc bánh. Hỏi cửa hàng có tất cả bao nhiêu chiếc bánh?',
  question: 'Cửa hàng có tất cả bao nhiêu chiếc bánh?',
  hints: [
    'Tìm hai số cho biết số hộp và số bánh trong mỗi hộp.',
    'Mỗi hộp đều có 6 chiếc bánh. Em nên dùng phép tính nào?',
    'Đặt tính 245 × 6.',
  ],
};

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const body = url.includes('/grades/4/catalog') ? catalogFixture : demoProblem;
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('student frontend', () => {
  it('renders the four primary home actions', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /Giải bài/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Học theo dạng/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Bài tập hôm nay/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ôn phần em còn yếu/i })).toBeInTheDocument();
  });

  it('renders the home slider and learning choices as the reference card system', () => {
    render(<App />);

    const slider = screen.getByRole('region', { name: 'Khám phá Toán lớp 4' });
    expect(within(slider).getByRole('img', { name: 'Minh sẵn sàng học Toán' })).toHaveAttribute(
      'src',
      '/assets/redesign/home-hero-wide.webp',
    );
    expect(within(slider).getByRole('link', { name: /Học từng bước/i })).toHaveClass(
      'button',
      'button-primary',
      'button-large',
    );

    const choices = screen.getByRole('list', { name: 'Cách bắt đầu học' });
    expect(within(choices).getAllByRole('listitem')).toHaveLength(4);
  });

  it('accepts a text problem and starts a learning session', async () => {
    window.history.replaceState(null, '', '/solve/text');
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByLabelText('Đề bài');
    await user.type(
      textarea,
      'Lan có 24 quyển vở và chia đều cho 4 bạn. Hỏi mỗi bạn có mấy quyển?',
    );
    await user.click(screen.getByRole('button', { name: /Bắt đầu/i }));

    expect(await screen.findByText('Bài toán cho chúng ta biết những gì?')).toBeInTheDocument();
    expect(screen.getByText(/Lan có 24 quyển vở/i)).toBeInTheDocument();
  });

  it('accepts student input in the guided learning workspace', async () => {
    window.history.replaceState(null, '', '/learn/session');
    const user = userEvent.setup();
    render(<App />);

    const answer = await screen.findByLabelText('Suy nghĩ của em');
    await user.type(answer, 'Có 245 hộp và mỗi hộp có 6 chiếc bánh.');

    expect(answer).toHaveValue('Có 245 hộp và mỗi hộp có 6 chiếc bánh.');
  });

  it('shows a contextual hint without revealing the final answer', async () => {
    window.history.replaceState(null, '', '/learn/session');
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Gợi ý/i }));

    expect(screen.getByText('Tìm hai số cho biết số hộp và số bánh trong mỗi hộp.')).toBeVisible();
    expect(screen.queryByText(/1 470 chiếc bánh/)).not.toBeInTheDocument();
  });

  it('keeps primary navigation available at a mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    window.dispatchEvent(new Event('resize'));
    render(<App />);

    const mobileNav = screen.getByRole('navigation', {
      name: 'Điều hướng chính trên điện thoại',
    });
    expect(mobileNav).toHaveTextContent('Trang chủ');
    expect(mobileNav).toHaveTextContent('Học theo dạng');
    expect(mobileNav).toHaveTextContent('Ôn tập');
    expect(mobileNav).toHaveTextContent('Của em');
  });

  it('uses the dedicated parent navigation shell without the child mobile navigation', () => {
    window.history.replaceState(null, '', '/parent');
    render(<App />);

    expect(screen.getByRole('main')).toHaveTextContent('Theo dõi việc học của Minh');

    const parentNav = screen.getByRole('navigation', { name: 'Khu vực phụ huynh' });
    expect(parentNav).toHaveClass('parent-only-nav');
    expect(parentNav).toHaveTextContent('Tổng quan');
    expect(parentNav).not.toHaveTextContent('Học theo dạng');
    expect(parentNav).not.toHaveTextContent('Kiểm tra');
    expect(parentNav).not.toHaveTextContent('Ôn tập');
    expect(parentNav).not.toHaveTextContent('Của em');

    expect(screen.getByRole('link', { name: /Khu vực của con/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Điều hướng chính trên điện thoại' }),
    ).not.toBeInTheDocument();
  });
});
