import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import {
  isLocalEmailRegistered,
  isLocalNicknameRegistered,
  registerLocalUser,
} from '../../services/localAuth';
import '../AuthChat.css';

type SignupStep = 'email' | 'nickname' | 'password' | 'confirm' | 'complete';

function SignupPage() {
  const navigate = useNavigate();
  const [signupStep, setSignupStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const validatePassword = (value: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(value);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setEmailAvailable(true);
    setEmailChecked(false);
    setSignupStep('email');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const checkEmailAvailability = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('유효한 이메일을 입력해주세요.');
      return;
    }

    const isRegistered = await isLocalEmailRegistered(email);
    setEmailAvailable(!isRegistered);
    setEmailChecked(true);

    if (isRegistered) {
      setErrorMessage('이미 사용 중인 이메일입니다.');
      return;
    }

    setSignupStep('nickname');
  };

  const handleNicknameNext = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!nickname.trim()) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    if (await isLocalNicknameRegistered(nickname)) {
      setErrorMessage('이미 사용 중인 닉네임입니다.');
      return;
    }

    setSignupStep('password');
  };

  const handlePasswordNext = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    setSignupStep('confirm');
  };

  const handleConfirmClick = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('유효한 이메일을 입력해주세요.');
      return;
    }

    if (!emailChecked) {
      setErrorMessage('이메일 중복 확인을 해주세요.');
      return;
    }

    if (!emailAvailable) {
      setErrorMessage('이미 사용 중인 이메일입니다.');
      return;
    }

    if (!nickname.trim()) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    if (await isLocalNicknameRegistered(nickname)) {
      setErrorMessage('이미 사용 중인 닉네임입니다.');
      return;
    }

    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await registerLocalUser({ email, password, nickname });
      setSuccessMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      setSignupStep('complete');
      window.setTimeout(() => navigate(ROUTES.login), 900);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    }
  };

  return (
    <main className="auth-chat-page auth-chat-page--single">
      <section className="auth-chat-hero">
        <p className="eyebrow">Create account</p>
        <h1>새 계정 만들기</h1>
        <p>필요한 정보만 순서대로 묻고 확인할게요.</p>
      </section>

      <section className="auth-chat-panel" aria-label="회원가입">
        <div className="auth-chat-thread">
          <div className="auth-chat-bubble auth-chat-bubble--bot">
            <strong>LangPT</strong>
            <p>가입에 사용할 이메일을 먼저 알려주세요.</p>
          </div>

          <div className="auth-chat-field">
            <input
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="이메일"
              required
              value={email}
              onChange={handleEmailChange}
              disabled={signupStep !== 'email'}
            />
            {signupStep === 'email' && (
              <button type="button" onClick={checkEmailAvailability}>
                중복 확인
              </button>
            )}
          </div>

          {emailChecked && emailAvailable && signupStep !== 'email' && (
            <div className="auth-chat-bubble auth-chat-bubble--user">
              <p>{email}</p>
            </div>
          )}

          {signupStep !== 'email' && (
            <>
              <div className="auth-chat-bubble auth-chat-bubble--bot">
                <strong>LangPT</strong>
                <p>좋아요. 채팅에서 사용할 닉네임은 무엇으로 할까요?</p>
              </div>
              <div className="auth-chat-field">
                <input
                  type="text"
                  placeholder="닉네임"
                  required
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  disabled={signupStep !== 'nickname'}
                />
                {signupStep === 'nickname' && (
                  <button type="button" onClick={handleNicknameNext}>
                    다음
                  </button>
                )}
              </div>
            </>
          )}

          {(signupStep === 'password' || signupStep === 'confirm' || signupStep === 'complete') && (
            <>
              <div className="auth-chat-bubble auth-chat-bubble--user">
                <p>{nickname}</p>
              </div>
              <div className="auth-chat-bubble auth-chat-bubble--bot">
                <strong>LangPT</strong>
                <p>비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 해요.</p>
              </div>
              <div className="auth-chat-field auth-chat-field--password">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="비밀번호"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={signupStep !== 'password'}
                />
                {signupStep === 'password' && (
                  <>
                    <button type="button" className="auth-chat-ghost" onClick={() => setPasswordVisible((visible) => !visible)}>
                      {passwordVisible ? '숨김' : '보기'}
                    </button>
                    <button type="button" onClick={handlePasswordNext}>
                      다음
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {(signupStep === 'confirm' || signupStep === 'complete') && (
            <>
              <div className="auth-chat-bubble auth-chat-bubble--user">
                <p>비밀번호를 설정했어요.</p>
              </div>
              <div className="auth-chat-bubble auth-chat-bubble--bot">
                <strong>LangPT</strong>
                <p>마지막으로 같은 비밀번호를 한 번 더 입력해주세요.</p>
              </div>
              <div className="auth-chat-field auth-chat-field--password">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="비밀번호 확인"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={signupStep !== 'confirm'}
                />
                {signupStep === 'confirm' && (
                  <button type="button" onClick={handleConfirmClick}>
                    계정 만들기
                  </button>
                )}
              </div>
            </>
          )}

          {errorMessage && (
            <div className="auth-chat-bubble auth-chat-bubble--alert" role="alert">
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="auth-chat-bubble auth-chat-bubble--success" role="status">
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default SignupPage;
