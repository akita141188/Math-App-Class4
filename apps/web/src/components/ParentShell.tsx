import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  ClipboardCheck,
  Home,
  LibraryBig,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/learn', label: 'Học theo dạng', icon: LibraryBig, end: false },
  { to: '/tests', label: 'Kiểm tra', icon: ClipboardCheck, end: false },
  { to: '/review', label: 'Ôn tập', icon: BookOpen, end: false },
  { to: '/me', label: 'Của em', icon: UserRound, end: false },
];

export function ParentShell() {
  return (
    <div className={'parent-shell redesign-parent-shell'}>
      <a className={'skip-link'} href={'#parent-content'}>
        Đi tới nội dung chính
      </a>
      <header className={'parent-topbar redesign-parent-topbar'}>
        <Link
          to={'/'}
          className={'brand redesign-brand'}
          aria-label={'Quay về khu vực học của Minh'}
        >
          <span className={'brand-mark redesign-brand-mark'} aria-hidden={'true'}>
            <BookOpenCheck size={24} />
          </span>
          <span>
            <strong>Học Toán</strong>
            <small>Lớp 4 · Hà Nội</small>
          </span>
        </Link>

        <nav className={'desktop-nav redesign-nav parent-nav'} aria-label={'Điều hướng chính'}>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon aria-hidden={'true'} size={18} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={'parent-shell-actions'}>
          <span className={'parent-mode-pill'}>
            <ShieldCheck size={18} /> Khu vực phụ huynh
          </span>
          <Link to={'/'} className={'back-link parent-back-button'}>
            <ArrowLeft size={17} /> Khu vực của con
          </Link>
        </div>
      </header>
      <main id={'parent-content'}>
        <Outlet />
      </main>
    </div>
  );
}
