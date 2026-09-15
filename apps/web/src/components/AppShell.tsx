import {
  BookOpen,
  BookOpenCheck,
  ChevronDown,
  ClipboardCheck,
  History,
  Home,
  LibraryBig,
  UsersRound,
  UserRound,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/learn', label: 'Học theo dạng', icon: LibraryBig, end: false },
  { to: '/tests', label: 'Kiểm tra', icon: ClipboardCheck, end: false },
  { to: '/review', label: 'Ôn tập', icon: BookOpen, end: false },
  { to: '/history', label: 'Lịch sử', icon: History, end: false },
  { to: '/me', label: 'Của em', icon: UserRound, end: false },
];

export function AppShell() {
  return (
    <div className={'app-shell redesign-shell'}>
      <a className={'skip-link'} href={'#main-content'}>
        Đi tới nội dung chính
      </a>
      <header className={'topbar redesign-topbar'}>
        <NavLink
          to={'/'}
          className={'brand redesign-brand'}
          aria-label={'Học Toán lớp 4 - Trang chủ'}
        >
          <span className={'brand-mark redesign-brand-mark'} aria-hidden={'true'}>
            <BookOpenCheck size={24} strokeWidth={2.2} />
          </span>
          <span>
            <strong>Học Toán</strong>
            <small>Lớp 4 · Hà Nội</small>
          </span>
        </NavLink>
        <nav className={'desktop-nav redesign-nav'} aria-label={'Điều hướng chính'}>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon aria-hidden={'true'} size={19} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={'topbar-actions'}>
          <NavLink className={'parent-link redesign-parent-link'} to={'/parent'}>
            <UsersRound size={18} aria-hidden={'true'} />
            <span>Dành cho phụ huynh</span>
          </NavLink>
          <span className={'student-avatar'} aria-label={'Hồ sơ của Minh'}>
            <span aria-hidden={'true'}>M</span>
            <ChevronDown size={14} aria-hidden={'true'} />
          </span>
        </div>
      </header>
      <main id={'main-content'}>
        <Outlet />
      </main>
      <nav
        className={'mobile-nav redesign-mobile-nav'}
        aria-label={'Điều hướng chính trên điện thoại'}
      >
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon aria-hidden={'true'} size={21} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
