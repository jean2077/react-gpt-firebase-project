import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import {
  isLocalEmailRegistered,
  isLocalNicknameRegistered,
  registerLocalUser,
} from '../../services/localAuth';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
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
      window.setTimeout(() => navigate(ROUTES.login), 900);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    }
  };

  return (
    <main>
      <div className="hello_mangement">
        <span>새 계정 만들기</span>
      </div>

      <section className="form-container" aria-label="회원가입">
        <div className="input-group">
          <span>이메일</span>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            required
            value={email}
            onChange={handleEmailChange}
          />
          <button type="button" onClick={checkEmailAvailability} className="email-check-button">
            중복 확인
          </button>
        </div>

        {!emailAvailable && emailChecked && (
          <p className="error-message">이미 사용 중인 이메일입니다.</p>
        )}
        {emailAvailable && emailChecked && (
          <p className="success-message">사용 가능한 이메일입니다.</p>
        )}

        <div className="input-group">
          <span>닉네임</span>
          <input
            type="text"
            placeholder="닉네임을 입력하세요"
            required
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </div>

        <div className="input-group password-container">
          <span>비밀번호</span>
          <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="비밀번호를 입력하세요"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="password-toggle"
          >
            {passwordVisible ? '숨김' : '보기'}
          </button>
        </div>

        <div className="input-group password-container">
          <span>비밀번호 확인</span>
          <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="비밀번호를 다시 입력하세요"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <button type="button" className="confirm-button" onClick={handleConfirmClick}>
          확인
        </button>
      </section>
    </main>
  );
}

export default SignupPage;
