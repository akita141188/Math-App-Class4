import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionExitDialog } from '../components/SessionExitDialog';
import { useSessionExitGuard } from './useSessionExitGuard';

function Harness({ onSaved }: { onSaved: () => void }) {
  const guard = useSessionExitGuard({
    enabled: true,
    message: 'Bài sẽ được lưu vào Lịch sử.',
    onConfirmedExit: onSaved,
  });

  return (
    <>
      <a href={'/other'}>Kết thúc</a>
      <SessionExitDialog {...guard} />
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useSessionExitGuard custom modal', () => {
  it('uses a React alertdialog instead of window.confirm for in-app exit', async () => {
    const onSaved = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm');
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path={'/session'} element={<Harness onSaved={onSaved} />} />
          <Route path={'/other'} element={<div>Đã rời phiên</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Kết thúc' }));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeVisible();
    expect(screen.getByText('Em có muốn thoát không?')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Ở lại làm tiếp' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.queryByText('Đã rời phiên')).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Kết thúc' }));
    await user.click(screen.getByRole('button', { name: 'Thoát và lưu bài' }));

    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Đã rời phiên')).toBeVisible();
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('closes the custom modal with Escape without leaving', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path={'/session'} element={<Harness onSaved={() => undefined} />} />
          <Route path={'/other'} element={<div>Đã rời phiên</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Kết thúc' }));
    expect(screen.getByRole('alertdialog')).toBeVisible();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Đã rời phiên')).not.toBeInTheDocument();
  });
});
