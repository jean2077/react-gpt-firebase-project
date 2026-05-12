import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { ROUTES } from './routes';
import LoginPage from '../pages/LoginPage/LoginPage';
import HomePage from '../pages/HomePage/HomePage';
import OnboardingPage from '../pages/OnboardingPage/OnboardingPage';
import ChatPage from '../pages/ChatPage/ChatPage';
import SignupPage from '../pages/SignupPage/SignupPage';
import StatsPage from '../pages/StatsPage/StatsPage';
import FindAccountPage from '../pages/FindAccountPage/FindAccountPage';
import QuizPage from '../pages/QuizPage/QuizPage';
import AppHeader from '../components/layout/AppHeader';

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};


// App.tsx는 라우터 기능을 담당합니다.
// 라우팅하는 자리
function App() {
  return (
    <Router future={routerFutureConfig}>
      <div className="App">
        <AppHeader />
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
          <Route path={ROUTES.chat} element={<ChatPage />} />
          <Route path={ROUTES.signup} element={<SignupPage />} />
          <Route path={ROUTES.stats} element={<StatsPage />} />
          <Route path={ROUTES.findAccount} element={<FindAccountPage />} />
          <Route path={ROUTES.quiz} element={<QuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
