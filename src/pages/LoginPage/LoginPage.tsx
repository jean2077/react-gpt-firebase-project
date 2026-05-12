import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FIND_ACCOUNT_TABS, ROUTES } from '../../app/routes';
import { signInAsDemoUser } from '../../services/localAuth';
import './LoginPage.css';

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signInAsDemoUser();
      navigate(ROUTES.onboarding);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container">
      <section className="hello_2">Hello, LangPT</section>

      <section className="chat_ractangle2" aria-label="로그인">
        <button
          type="button"
          className="google-button"
          onClick={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? '로그인 중' : '로그인'}
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="auth-link-container">
          <Link
            to={`${ROUTES.findAccount}?tab=${FIND_ACCOUNT_TABS.id}`}
            className="auth-link"
          >
            아이디 찾기
          </Link>
          <Link
            to={`${ROUTES.findAccount}?tab=${FIND_ACCOUNT_TABS.password}`}
            className="auth-link"
          >
            비밀번호 찾기
          </Link>
          <Link to={ROUTES.signup} className="newmember-button">
            회원가입
          </Link>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
