import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import {
  DEFAULT_DAILY_GOALS,
  getDailyGoals,
  getLearningEvents,
  getLevelTestResult,
  getSavedExpressions,
  getTodayGoalProgress,
  saveDailyGoals,
  saveLevelTestResult,
} from '../../services/learningArtifacts';
import { DEFAULT_STATS, fetchRandomQuote, fetchUserStats } from '../../services/statsService';
import type { DailyLearningGoals, LevelResult } from '../../types/domain';
import './StatsPage.css';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const levelQuestions = [
  {
    id: 'sentence',
    question: '“나는 매일 커피를 마셔요.”를 자연스럽게 영어로 고르면?',
    options: ['I drink coffee every day.', 'I coffee drink every day.', 'I am coffee every day.'],
    answerIndex: 0,
  },
  {
    id: 'tone',
    question: '회의 일정을 정중하게 바꾸고 싶을 때 가장 자연스러운 표현은?',
    options: ['Move meeting.', 'Could we reschedule the meeting?', 'Meeting change now.'],
    answerIndex: 1,
  },
  {
    id: 'meaning',
    question: '중국어 “谢谢”의 뜻은?',
    options: ['안녕하세요', '감사합니다', '미안합니다'],
    answerIndex: 1,
  },
];

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const getProgressPercent = (value: number, goal: number) =>
  clamp(Math.round((value / goal) * 100));

const buildWeeklyTrend = (studyMinutes: number, chatCount: number) => {
  const totalMinutes = studyMinutes > 0 ? studyMinutes : chatCount * 4;

  if (totalMinutes <= 0) {
    return WEEK_DAYS.map((day) => ({ day, minutes: 0 }));
  }

  const weights = [0.55, 0.72, 0.64, 0.9, 0.76, 1.05, 1.22];
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  return WEEK_DAYS.map((day, index) => ({
    day,
    minutes: Math.max(1, Math.round((totalMinutes * weights[index]) / totalWeight)),
  }));
};

const getLearningScore = (
  dailyTotalTime: number,
  weeklyChatCount: number,
  totalQuizScore: number
) =>
  clamp(
    Math.round(
      getProgressPercent(dailyTotalTime, 210) * 0.4 +
        getProgressPercent(weeklyChatCount, 14) * 0.35 +
        getProgressPercent(totalQuizScore, 10) * 0.25
    )
  );

const getStudyRecommendation = (dailyTotalTime: number) => {
  if (dailyTotalTime >= 300) {
    return { label: '300분 달성', copy: '장기 루틴이 만들어졌어요. 오늘은 자유 대화를 늘려보세요.' };
  }

  if (dailyTotalTime >= 200) {
    return { label: '200분 달성', copy: '문장 첨삭과 퀴즈를 섞으면 기억이 더 오래갑니다.' };
  }

  if (dailyTotalTime >= 100) {
    return { label: '100분 달성', copy: '저장한 표현을 다시 말해보며 복습 리듬을 유지해보세요.' };
  }

  return { label: '오늘의 시작', copy: '짧은 대화 5문장부터 시작하면 충분합니다.' };
};

const getLevelLabel = (level: LevelResult) => {
  if (level === 'advanced') return '고급';
  if (level === 'intermediate') return '중급';
  return '초급';
};

const getLevelFromScore = (score: number): LevelResult => {
  if (score >= 3) return 'advanced';
  if (score >= 2) return 'intermediate';
  return 'beginner';
};

function StatsPage() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [randomQuote, setRandomQuote] = useState('');
  const [recommendation, setRecommendation] = useState(() =>
    getStudyRecommendation(DEFAULT_STATS.dailyTotalTime)
  );
  const [statusMessage, setStatusMessage] = useState('');
  const [dailyGoals, setDailyGoals] = useState<DailyLearningGoals>(() => getDailyGoals());
  const [goalDraft, setGoalDraft] = useState<DailyLearningGoals>(() => getDailyGoals());
  const [goalProgress, setGoalProgress] = useState(() => getTodayGoalProgress());
  const [events, setEvents] = useState(() => getLearningEvents());
  const [savedExpressionCount, setSavedExpressionCount] = useState(() => getSavedExpressions().length);
  const [levelAnswers, setLevelAnswers] = useState<Record<string, number>>({});
  const [levelResult, setLevelResult] = useState(() => getLevelTestResult());
  const navigate = useNavigate();

  const weeklyTrend = buildWeeklyTrend(stats.dailyTotalTime, stats.weeklyChatCount);
  const maxTrendMinutes = Math.max(...weeklyTrend.map((item) => item.minutes), 1);
  const learningScore = getLearningScore(
    stats.dailyTotalTime,
    stats.weeklyChatCount,
    stats.totalQuizScore
  );
  const goalMetrics = [
    {
      label: '학습 시간',
      value: stats.dailyTotalTime,
      goal: 210,
      unit: '분',
      accent: 'blue',
    },
    {
      label: '채팅 연습',
      value: stats.weeklyChatCount,
      goal: 14,
      unit: '회',
      accent: 'teal',
    },
    {
      label: '퀴즈 점수',
      value: stats.totalQuizScore,
      goal: 10,
      unit: '점',
      accent: 'coral',
    },
  ];
  const todayGoalRows = [
    {
      label: '문장 말하기',
      value: goalProgress.sentenceCount,
      goal: dailyGoals.sentenceGoal,
      unit: '문장',
      accent: 'blue',
    },
    {
      label: '퀴즈 풀기',
      value: goalProgress.quizCount,
      goal: dailyGoals.quizGoal,
      unit: '개',
      accent: 'teal',
    },
    {
      label: '표현 저장',
      value: goalProgress.expressionCount,
      goal: dailyGoals.expressionGoal,
      unit: '개',
      accent: 'coral',
    },
  ];
  const latestEvents = useMemo(() => events.slice(0, 8), [events]);
  const answeredCount = Object.keys(levelAnswers).length;

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const userStats = await fetchUserStats('local-user');
        const quote = await fetchRandomQuote();

        if (!isMounted) return;

        if (userStats) {
          setStats(userStats);
          setRecommendation(getStudyRecommendation(userStats.dailyTotalTime));
        } else {
          setStatusMessage('아직 표시할 학습 기록이 없습니다.');
        }

        setRandomQuote(quote || '작은 문장 하나가 오늘의 실력을 만듭니다.');
        setGoalProgress(getTodayGoalProgress());
        setEvents(getLearningEvents());
        setSavedExpressionCount(getSavedExpressions().length);
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

  const handleGoalChange = (key: keyof DailyLearningGoals, value: string) => {
    setGoalDraft((previousGoals) => ({
      ...previousGoals,
      [key]: Number(value) || DEFAULT_DAILY_GOALS[key],
    }));
  };

  const handleSaveGoals = () => {
    saveDailyGoals(goalDraft);
    setDailyGoals(goalDraft);
    setGoalProgress(getTodayGoalProgress());
  };

  const handleFinishLevelTest = () => {
    const score = levelQuestions.reduce(
      (total, question) => total + (levelAnswers[question.id] === question.answerIndex ? 1 : 0),
      0
    );
    const result = {
      level: getLevelFromScore(score),
      score,
      total: levelQuestions.length,
      createdAt: new Date().toISOString(),
    };
    saveLevelTestResult(result);
    setLevelResult(result);
    setEvents(getLearningEvents());
  };

  return (
    <div className="stats-container">
      <section className="stats-hero">
        <div>
          <p className="eyebrow">Learning dashboard</p>
          <h1 className="greeting">학습 현황을 한눈에 확인하세요.</h1>
        </div>
        <div className="score-ring" aria-label={`학습 점수 ${learningScore}점`}>
          <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
            <circle className="score-ring__track" cx="60" cy="60" r="52" />
            <circle
              className="score-ring__value"
              cx="60"
              cy="60"
              r="52"
              style={{ '--score-offset': 327 - (327 * learningScore) / 100 } as React.CSSProperties}
            />
          </svg>
          <strong>{learningScore}</strong>
          <span>학습 점수</span>
        </div>
      </section>

      {statusMessage && <p className="stats-status">{statusMessage}</p>}

      <div className="stats-grid">
        <div className="stats-card card-blue">
          <h3>일주일 채팅 수</h3>
          <p>{stats.weeklyChatCount}회</p>
        </div>
        <div className="stats-card card-green">
          <h3>일일 평균 사용 시간</h3>
          <p>{stats.dailyAvgStudyTime}분</p>
        </div>
        <div className="stats-card card-purple">
          <h3>총 사용 시간</h3>
          <p>{stats.dailyTotalTime}분</p>
        </div>
        <div className="stats-card card-orange">
          <h3>총 퀴즈 점수</h3>
          <p>{stats.totalQuizScore}점</p>
        </div>
        <div className="stats-card card-yellow">
          <h3>저장한 표현</h3>
          <p>{savedExpressionCount}개</p>
        </div>
      </div>

      <section className="daily-goal-panel" aria-label="오늘의 목표">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Today goals</p>
            <h2>오늘의 목표</h2>
          </div>
          <button type="button" onClick={handleSaveGoals}>목표 저장</button>
        </div>
        <div className="today-goal-grid">
          {todayGoalRows.map((goal) => {
            const percent = getProgressPercent(goal.value, goal.goal);

            return (
              <div key={goal.label} className={`today-goal today-goal--${goal.accent}`}>
                <div>
                  <span>{goal.label}</span>
                  <strong>
                    {goal.value}/{goal.goal}
                    {goal.unit}
                  </strong>
                </div>
                <div className="goal-meter" aria-label={`${goal.label} ${percent}%`}>
                  <i style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="goal-editor">
          <label>
            문장
            <input
              type="number"
              min="1"
              value={goalDraft.sentenceGoal}
              onChange={(event) => handleGoalChange('sentenceGoal', event.target.value)}
            />
          </label>
          <label>
            퀴즈
            <input
              type="number"
              min="1"
              value={goalDraft.quizGoal}
              onChange={(event) => handleGoalChange('quizGoal', event.target.value)}
            />
          </label>
          <label>
            저장
            <input
              type="number"
              min="1"
              value={goalDraft.expressionGoal}
              onChange={(event) => handleGoalChange('expressionGoal', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="learning-dashboard" aria-label="그래프로 보는 학습 현황">
        <article className="chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Weekly rhythm</p>
              <h2>이번 주 학습 시간</h2>
            </div>
            <strong>{stats.dailyTotalTime}분</strong>
          </div>
          <div className="weekly-bars" aria-label="요일별 학습 시간">
            {weeklyTrend.map((item) => (
              <div key={item.day} className="weekly-bar">
                <span>{item.minutes}분</span>
                <div
                  className="weekly-bar__track"
                  style={
                    {
                      '--bar-height': `${Math.max(8, (item.minutes / maxTrendMinutes) * 100)}%`,
                    } as React.CSSProperties
                  }
                >
                  <i />
                </div>
                <strong>{item.day}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="progress-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Goal progress</p>
              <h2>목표 달성률</h2>
            </div>
          </div>
          <div className="goal-list">
            {goalMetrics.map((metric) => {
              const percent = getProgressPercent(metric.value, metric.goal);

              return (
                <div key={metric.label} className={`goal-row goal-row--${metric.accent}`}>
                  <div>
                    <span>{metric.label}</span>
                    <strong>
                      {metric.value}/{metric.goal}
                      {metric.unit}
                    </strong>
                  </div>
                  <div className="goal-meter" aria-label={`${metric.label} ${percent}%`}>
                    <i style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="timeline-level-grid">
        <article className="timeline-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Learning timeline</p>
              <h2>학습 히스토리</h2>
            </div>
          </div>
          <div className="timeline-list">
            {latestEvents.map((event) => (
              <div key={event.id} className={`timeline-item timeline-item--${event.type}`}>
                <span>{event.title}</span>
                <p>{event.description}</p>
                <small>{new Date(event.createdAt).toLocaleString('ko-KR')}</small>
              </div>
            ))}
            {latestEvents.length === 0 && (
              <p className="timeline-empty">아직 기록이 없습니다. 채팅, 퀴즈, 표현 저장을 시작해보세요.</p>
            )}
          </div>
        </article>

        <article className="level-test-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Level check</p>
              <h2>레벨 테스트</h2>
            </div>
            {levelResult && <strong>{getLevelLabel(levelResult.level)}</strong>}
          </div>
          {levelQuestions.map((question) => (
            <div key={question.id} className="level-question">
              <p>{question.question}</p>
              <div>
                {question.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={levelAnswers[question.id] === index ? 'level-answer--active' : ''}
                    onClick={() =>
                      setLevelAnswers((previousAnswers) => ({
                        ...previousAnswers,
                        [question.id]: index,
                      }))
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="level-submit"
            onClick={handleFinishLevelTest}
            disabled={answeredCount < levelQuestions.length}
          >
            {levelResult ? '다시 결과 저장' : '레벨 추천 받기'}
          </button>
          {levelResult && (
            <p className="level-result-copy">
              {levelResult.total}문제 중 {levelResult.score}문제 정답입니다. 현재 추천 레벨은{' '}
              <strong>{getLevelLabel(levelResult.level)}</strong>입니다.
            </p>
          )}
        </article>
      </section>

      <section className="insight-grid">
        <div className="recommendation">
          <h3>학습 추천</h3>
          <div className="recommendation-card" aria-label="학습 시간 추천">
            <span>{recommendation.label}</span>
            <p>{recommendation.copy}</p>
          </div>
        </div>

        <div className="quote-section">
          <h3>오늘의 명언</h3>
          <p>{randomQuote}</p>
          <button onClick={() => navigate(ROUTES.quiz)} className="quiz-button">퀴즈 풀기</button>
        </div>
      </section>
    </div>
  );
}

export default StatsPage;
