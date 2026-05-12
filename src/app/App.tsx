import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ROUTES } from './routes';
import LoginPage from '../pages/LoginPage/LoginPage';
import HomePage from '../pages/HomePage/HomePage';
import BoardPage from '../pages/BoardPage/BoardPage';
import ChatPage from '../pages/ChatPage/ChatPage';
import VocabularyPage from '../pages/VocabularyPage/VocabularyPage';
import SignupPage from '../pages/SignupPage/SignupPage';
import StatsPage from '../pages/StatsPage/StatsPage';
import FindAccountPage from '../pages/FindAccountPage/FindAccountPage';
import QuizPage from '../pages/QuizPage/QuizPage';
import AppHeader from '../components/layout/AppHeader';
import AppFooter from '../components/layout/AppFooter';

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const glassTransitionRoutes = new Set([ROUTES.chat, ROUTES.stats]);

function AppRoutes() {
  const location = useLocation();
  const isGlassTransitionRoute = glassTransitionRoutes.has(location.pathname);
  const transitionClassName = [
    'route-transition',
    isGlassTransitionRoute ? 'route-transition--glass' : 'route-transition--enter',
  ].join(' ');

  return (
    <div key={location.pathname} className={transitionClassName}>
      <Routes location={location}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.chat} element={<ChatPage />} />
        <Route path={ROUTES.board} element={<BoardPage />} />
        <Route path={ROUTES.vocabulary} element={<VocabularyPage />} />
        <Route path={ROUTES.signup} element={<SignupPage />} />
        <Route path={ROUTES.stats} element={<StatsPage />} />
        <Route path={ROUTES.findAccount} element={<FindAccountPage />} />
        <Route path={ROUTES.quiz} element={<QuizPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router future={routerFutureConfig}>
      <div className="App">
        <AppHeader />
        <AppRoutes />
        <AppFooter />
      </div>
    </Router>
  );
}

export default App;
