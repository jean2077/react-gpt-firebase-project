import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { findLocalAccount, resetLocalPassword } from '../../services/localAuth';
import '../AuthChat.css';

type RecoveryMode = 'id' | 'password';
type RecoveryStep = 'mode' | 'email' | 'done';

const FindAccountPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('tab') === 'password'
    ? 'password'
    : searchParams.has('tab')
      ? 'id'
      : null;
  const [activeMode, setActiveMode] = useState<RecoveryMode | null>(initialMode);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>(initialMode ? 'email' : 'mode');

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleModeSelect = (mode: RecoveryMode) => {
    setMessage('');
    setError('');
    setActiveMode(mode);
    setRecoveryStep('email');
    setSearchParams({ tab: mode });
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setMessage('');
    setError('');
  };

  const handleFindId = async () => {
    if (!validateEmail(email)) {
      setError('유효한 이메일을 입력해주세요.');
      return;
    }

    const account = await findLocalAccount(email);
    if (!account) {
      setError('해당 이메일로 가입된 계정이 없습니다.');
      return;
    }

    setMessage(`가입된 계정: ${account.email}`);
    setRecoveryStep('done');
  };

  const handleFindPassword = async () => {
    if (!validateEmail(email)) {
      setError('유효한 이메일을 입력해주세요.');
      return;
    }

    try {
      const { temporaryPassword } = await resetLocalPassword(email);
      setMessage(`임시 비밀번호로 재설정했습니다: ${temporaryPassword}`);
      setRecoveryStep('done');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : '비밀번호 재설정에 실패했습니다.');
    }
  };

  return (
    <main className="auth-chat-page auth-chat-page--single">
      <section className="auth-chat-hero">
        <p className="eyebrow">Account help</p>
        <h1>계정 찾기</h1>
        <p>필요한 도움을 고르면 다음 단계가 열립니다.</p>
      </section>

      <section className="auth-chat-panel" aria-label="계정 찾기">
        <div className="auth-chat-thread">
          <div className="auth-chat-bubble auth-chat-bubble--bot">
            <strong>LangPT</strong>
            <p>어떤 계정 정보를 찾을까요?</p>
          </div>

          <div className="auth-chat-options">
            <button type="button" onClick={() => handleModeSelect('id')}>
              아이디 찾기
            </button>
            <button type="button" onClick={() => handleModeSelect('password')}>
              비밀번호 재설정
            </button>
          </div>

          {activeMode && (
            <>
              <div className="auth-chat-bubble auth-chat-bubble--user">
                <p>{activeMode === 'id' ? '아이디를 찾고 싶어요.' : '비밀번호를 재설정할게요.'}</p>
              </div>
              <div className="auth-chat-bubble auth-chat-bubble--bot">
                <strong>LangPT</strong>
                <p>가입할 때 사용한 이메일을 입력해주세요.</p>
              </div>
              <div className="auth-chat-field">
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="이메일"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={recoveryStep === 'done'}
                />
                {recoveryStep !== 'done' && (
                  <button
                    type="button"
                    onClick={activeMode === 'id' ? handleFindId : handleFindPassword}
                  >
                    확인
                  </button>
                )}
              </div>
            </>
          )}

          {message && (
            <div className="auth-chat-bubble auth-chat-bubble--success" role="status">
              <p>{message}</p>
            </div>
          )}
          {error && (
            <div className="auth-chat-bubble auth-chat-bubble--alert" role="alert">
              <p>{error}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default FindAccountPage;
