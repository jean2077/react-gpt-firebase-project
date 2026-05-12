import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FIND_ACCOUNT_TABS, ROUTES } from '../../app/routes';
import { loginWithLocalCredentials, signInAsDemoUser } from '../../services/localAuth';
import '../AuthChat.css';

type LoginMode = 'demo' | 'local';
type LoginStep = 'method' | 'demo-ready' | 'email' | 'password';

const LoginPage = () => {
  const [loginMode, setLoginMode] = useState<LoginMode | null>(null);
  const [loginStep, setLoginStep] = useState<LoginStep>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSelectMode = (mode: LoginMode) => {
    setErrorMessage('');
    setLoginMode(mode);
    setLoginStep(mode === 'demo' ? 'demo-ready' : 'email');
  };

  const handleEmailNext = () => {
    setErrorMessage('');

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('유효한 이메일을 입력해주세요.');
      return;
    }

    setLoginStep('password');
  };

  const handleDemoLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signInAsDemoUser();
      navigate(ROUTES.chat);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  const handleLocalLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await loginWithLocalCredentials({ email, password });
      navigate(ROUTES.chat);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-chat-page">
      <section className="auth-chat-hero">
        <p className="eyebrow">LangPT access</p>
        <h1>Hello, LangPT</h1>
        <p>답장을 주고받듯 자연스럽게 입장해요.</p>
      </section>

      <section className="auth-chat-panel" aria-label="로그인">
        <div className="auth-chat-thread">
          <div className="auth-chat-bubble auth-chat-bubble--bot">
            <strong>LangPT</strong>
            <p>안녕하세요. 오늘은 어떤 방식으로 입장할까요?</p>
          </div>

          <div className="auth-chat-bubble auth-chat-bubble--bot">
            <strong>LangPT</strong>
            <p>바로 둘러보려면 데모, 기존 계정이 있으면 이메일 로그인을 선택하면 돼요.</p>
          </div>

          <div className="auth-chat-options">
            <button type="button" onClick={() => handleSelectMode('demo')}>
              데모로 바로 시작
            </button>
            <button type="button" onClick={() => handleSelectMode('local')}>
              가입 계정으로 로그인
            </button>
          </div>

          {loginMode && (
            <div className="auth-chat-bubble auth-chat-bubble--user">
              <p>{loginMode === 'demo' ? '데모로 바로 시작할게요.' : '가입한 계정으로 로그인할게요.'}</p>
            </div>
          )}

          {loginStep === 'demo-ready' && (
            <>
              <div className="auth-chat-bubble auth-chat-bubble--bot">
                <strong>LangPT</strong>
                <p>좋아요. 데모 계정으로 채팅 준비 화면까지 바로 열어드릴게요.</p>
              </div>
              <button
                type="button"
                className="auth-chat-primary"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? '로그인 중' : '채팅으로 이동'}
              </button>
            </>
          )}

          {(loginStep === 'email' || loginStep === 'password') && (
            <>
              <div className="auth-chat-bubble auth-chat-bubble--bot">
                <strong>LangPT</strong>
                <p>좋아요. 먼저 가입할 때 사용한 이메일을 알려주세요.</p>
              </div>
              <div className="auth-chat-field">
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {loginStep === 'email' && (
                  <button type="button" onClick={handleEmailNext}>다음</button>
                )}
              </div>
            </>
          )}

          {loginStep === 'password' && (
            <>
              <div className="auth-chat-bubble auth-chat-bubble--user">
                <p>{email}</p>
              </div>
              <div className="auth-chat-bubble auth-chat-bubble--bot">
                <strong>LangPT</strong>
                <p>확인했어요. 이제 비밀번호를 입력하면 바로 입장할 수 있어요.</p>
              </div>
              <div className="auth-chat-field">
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleLocalLogin();
                    }
                  }}
                />
                <button type="button" onClick={handleLocalLogin} disabled={isSubmitting}>
                  {isSubmitting ? '확인 중' : '로그인'}
                </button>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="auth-chat-bubble auth-chat-bubble--alert" role="alert">
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="auth-chat-links">
            <Link to={ROUTES.signup}>회원가입</Link>
            <Link to={`${ROUTES.findAccount}?tab=${FIND_ACCOUNT_TABS.id}`}>아이디 찾기</Link>
            <Link to={`${ROUTES.findAccount}?tab=${FIND_ACCOUNT_TABS.password}`}>비밀번호 찾기</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
