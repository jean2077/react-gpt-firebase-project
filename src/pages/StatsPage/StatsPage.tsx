import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import { DEFAULT_STATS, fetchRandomQuote, fetchUserStats } from '../../services/statsService';
import './StatsPage.css';

const getImageForTotalStudyTime = (dailyTotalTime: number): string => {
  if (dailyTotalTime >= 300) {
    return 'https://via.placeholder.com/300?text=300시간+성취';
  } else if (dailyTotalTime >= 200) {
    return 'https://via.placeholder.com/300?text=200시간+성취';
  } else if (dailyTotalTime >= 100) {
    return 'https://via.placeholder.com/300?text=100시간+성취';
  }

  return 'https://via.placeholder.com/300?text=더+공부해주세요';
};

function StatsPage() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  const [randomQuote, setRandomQuote] = useState('');
  const [imageUrl, setImageUrl] = useState('https://via.placeholder.com/300');
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const userId = "exampleUserId"; // 사용자 ID를 적절히 교체하세요 (예: 인증 시스템에서 가져오기)
        const userStats = await fetchUserStats(userId);
        const quote = await fetchRandomQuote();

        if (!isMounted) return;

        if (userStats) {
          setStats(userStats);
          setImageUrl(getImageForTotalStudyTime(userStats.dailyTotalTime));
        } else {
          setStatusMessage('아직 표시할 학습 기록이 없습니다.');
        }

        if (quote) {
          setRandomQuote(quote);
        } else {
          setRandomQuote('작은 문장 하나가 오늘의 실력을 만듭니다.');
        }
      } catch {
        setStatusMessage('학습 기록을 불러오지 못해 기본값으로 표시합니다.');
        setRandomQuote('작은 문장 하나가 오늘의 실력을 만듭니다.');
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="stats-container">
      <h1 className="greeting">안녕하세요, 얼마나 공부했을까요?</h1>
      {statusMessage && <p className="stats-status">{statusMessage}</p>}

      <div className="stats-grid">
        <div className="stats-card card-blue">
          <h3>일주일 채팅 수</h3>
          <p>{stats.weeklyChatCount} 회</p>
        </div>
        <div className="stats-card card-green">
          <h3>일일 평균 사용 시간</h3>
          <p>{stats.dailyAvgStudyTime} 분</p>
        </div>
        <div className="stats-card card-purple">
          <h3>총 사용 시간</h3>
          <p>{stats.dailyTotalTime} 분</p>
        </div>
        <div className="stats-card card-orange">
          <h3>총 퀴즈 점수</h3>
          <p>{stats.totalQuizScore} 점</p>
        </div>
        <div className="stats-card card-yellow">
          <h3>총 로그인 시간</h3>
          <p>{stats.totalLoginTime} 분</p>
        </div>
      </div>

      <div className="recommendation">
        <h3>학습 추천</h3>
        <img src={imageUrl} alt="학습 시간 추천" className="recommendation-image" />
      </div>

      <div className="quote-section">
        <h3>오늘의 명언</h3>
        <p>{randomQuote}</p>
        <button onClick={() => navigate(ROUTES.quiz)} className="quiz-button">퀴즈 풀기</button>
      </div>
    </div>
  );
}

export default StatsPage;
