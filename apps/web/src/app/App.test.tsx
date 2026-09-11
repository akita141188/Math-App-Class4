import type { DemoProblem } from '@math-app/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    vi.fn(async () =>
      Promise.resolve(
        new Response(JSON.stringify(demoProblem), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('student frontend', () => {
  it('renders the four primary home actions', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /Chụp bài toán/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Nhập bài toán/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Bài tập hôm nay/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ôn phần em còn yếu/i })).toBeInTheDocument();
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
    expect(mobileNav).toHaveTextContent('Giải bài');
    expect(mobileNav).toHaveTextContent('Ôn tập');
    expect(mobileNav).toHaveTextContent('Của em');
  });
});
