import { ArrowLeft, BookOpenCheck, LayoutDashboard } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export function ParentShell() {
  return (
    <div className={'parent-shell redesign-parent-shell'}>
      <a className={'skip-link'} href={'#parent-content'}>
        Đi tới nội dung chính
      </a>

      <header className={'parent-topbar redesign-parent-topbar'}>
        <Link to={'/parent'} className={'brand redesign-brand'} aria-label={'Khu vực phụ huynh'}>
          <span className={'brand-mark redesign-brand-mark'} aria-hidden={'true'}>
            <BookOpenCheck size={24} />
          </span>
          <span>
            <strong>Học Toán</strong>
            <small>Phụ huynh của Minh</small>
          </span>
        </Link>

        <nav
          className={'desktop-nav redesign-nav parent-only-nav'}
          aria-label={'Khu vực phụ huynh'}
        >
          <NavLink to={'/parent'} end>
            <LayoutDashboard aria-hidden={'true'} size={18} strokeWidth={2.2} />
            <span>Tổng quan</span>
          </NavLink>
        </nav>

        <div className={'parent-shell-actions parent-toggle-only'}>
          <Link to={'/'} className={'parent-link redesign-parent-link parent-area-toggle'}>
            <ArrowLeft size={17} aria-hidden={'true'} />
            <span>Khu vực của con</span>
          </Link>
        </div>
      </header>

      <main id={'parent-content'}>
        <Outlet />
      </main>
    </div>
  );
}
