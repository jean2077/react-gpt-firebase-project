import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import {
  getCurrentUser,
  logoutLocalUser,
  subscribeToLocalAuth,
} from '../../services/localAuth';
import type { LocalAuthUser } from '../../types/domain';
import langptLogo from '../../assets/brand/langpt-logo.png';
import './AppHeader.css';

const navItems = [
  { to: ROUTES.chat, label: '채팅' },
  { to: ROUTES.stats, label: '마이페이지' },
  { to: ROUTES.quiz, label: '퀴즈' },
];

function AppHeader() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<LocalAuthUser | null>(() => getCurrentUser());

  useEffect(() => subscribeToLocalAuth(setCurrentUser), []);

  const handleLogout = () => {
    logoutLocalUser();
    navigate(ROUTES.home);
  };

  return (
    <header className="app-header">
      <Link to={ROUTES.home} className="app-header__brand" aria-label="LangPT 홈">
        <img src={langptLogo} alt="LangPT" className="app-header__logo" />
      </Link>

      <nav className="app-header__nav" aria-label="주요 메뉴">
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
