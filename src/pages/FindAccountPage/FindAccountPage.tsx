import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { findLocalAccount, resetLocalPassword } from '../../services/localAuth';
import './FindAccountPage.css';

const FindAccountPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'password' ? 'find-password' : 'find-id';

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleTabChange = (tab: 'find-id' | 'find-password') => {
    setMessage('');
    setError('');
    setSearchParams({ tab: tab === 'find-password' ? 'password' : 'id' });
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
  };

  const handleFindPassword = async () => {
    if (!validateEmail(email)) {
      setError('유효한 이메일을 입력해주세요.');
      return;
    }

    try {
      const { temporaryPassword } = await resetLocalPassword(email);
      setMessage(`임시 비밀번호로 재설정했습니다: ${temporaryPassword}`);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : '비밀번호 재설정에 실패했습니다.');
    }
  };

  return (
    <main className="auth-container">
      <h2>{activeTab === 'find-id' ? '아이디 찾기' : '비밀번호 찾기'}</h2>

      <div className="tabs">
        <button
          type="button"
          className={activeTab === 'find-id' ? 'active' : ''}
          onClick={() => handleTabChange('find-id')}
        >
          아이디 찾기
        </button>
        <button
          type="button"
          className={activeTab === 'find-password' ? 'active' : ''}
          onClick={() => handleTabChange('find-password')}
        >
          비밀번호 찾기
        </button>
      </div>

      <input
        type="email"
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={handleEmailChange}
        className="input-field"
      />

      {activeTab === 'find-id' ? (
        <button type="button" onClick={handleFindId} className="auth-button">
          아이디 찾기
        </button>
      ) : (
        <button type="button" onClick={handleFindPassword} className="auth-button">
          비밀번호 찾기
        </button>
      )}

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </main>
  );
};

export default FindAccountPage;
