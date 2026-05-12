import React, { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import {
  getCurrentUser,
  logoutLocalUser,
  subscribeToLocalAuth,
} from '../../services/localAuth';
import { applyThemeMode, getPreferredTheme, type ThemeMode } from '../../services/theme';
import type { LocalAuthUser } from '../../types/domain';
import langptLogo from '../../assets/brand/langpt-logo.png';
import './AppHeader.css';

const navItems = [
  { to: ROUTES.chat, label: '채팅' },
  { to: ROUTES.board, label: '게시판' },
  { to: ROUTES.vocabulary, label: '단어장' },
  { to: ROUTES.stats, label: '마이페이지' },
  { to: ROUTES.quiz, label: '오늘의 퀴즈' },
];

type NavGlassStyle = CSSProperties & {
  '--active-index': number;
  '--active-opacity': number;
  '--nav-count': number;
};

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<LocalAuthUser | null>(() => getCurrentUser());
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getPreferredTheme());
  const isDarkMode = themeMode === 'dark';
  const activeNavIndex = useMemo(
    () =>
      navItems.findIndex(
        (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
      ),
    [location.pathname],
  );
  const navGlassStyle: NavGlassStyle = {
    '--active-index': Math.max(activeNavIndex, 0),
    '--active-opacity': activeNavIndex >= 0 ? 1 : 0,
    '--nav-count': navItems.length,
  };

  useEffect(() => subscribeToLocalAuth(setCurrentUser), []);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const handleLogout = () => {
    logoutLocalUser();
    navigate(ROUTES.home);
  };

  const handleThemeToggle = () => {
    setThemeMode((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="app-header">
      <Link to={ROUTES.home} className="app-header__brand" aria-label="LangPT 홈">
        <img src={langptLogo} alt="LangPT" className="app-header__logo" />
      </Link>

      <nav className="app-header__nav" style={navGlassStyle} aria-label="주요 메뉴">
        <span className="app-header__nav-glass" aria-hidden="true" />
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `app-header__link${isActive ? ' app-header__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className={`app-header__theme-toggle${
          isDarkMode ? ' app-header__theme-toggle--dark' : ''
        }`}
        aria-label={isDarkMode ? '일반모드로 변경' : '다크모드로 변경'}
        aria-pressed={isDarkMode}
        title={isDarkMode ? '일반모드로 변경' : '다크모드로 변경'}
        onClick={handleThemeToggle}
      >
        <span className="app-header__theme-icon" aria-hidden="true" />
        <span className="app-header__theme-text">{isDarkMode ? '라이트' : '다크'}</span>
      </button>

      {currentUser ? (
        <div className="app-header__account">
          <span className="app-header__user">{currentUser.nickname || currentUser.email}</span>
          <button
            type="button"
            className="app-header__action app-header__action--ghost"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <Link to={ROUTES.login} className="app-header__action">
          로그인
        </Link>
      )}
    </header>
  );
}

export default AppHeader;
