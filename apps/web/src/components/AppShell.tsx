import { BookOpen, Home, Sparkles, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/solve', label: 'Giải bài', icon: Sparkles, end: false },
  { to: '/review', label: 'Ôn tập', icon: BookOpen, end: false },
  { to: '/me', label: 'Của em', icon: UserRound, end: false },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Đi tới nội dung chính
      </a>
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Học Toán lớp 4 - Trang chủ">
          <span className="brand-mark" aria-hidden="true">
            4
          </span>
          <span>
            <strong>Học Toán</strong>
            <small>Lớp 4 · Hà Nội</small>
          </span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon aria-hidden="true" size={19} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink className="parent-link" to="/parent">
          Dành cho phụ huynh
        </NavLink>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <nav className="mobile-nav" aria-label="Điều hướng chính trên điện thoại">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon aria-hidden="true" size={21} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
