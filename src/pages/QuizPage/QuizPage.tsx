import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import { fetchChineseQuizzes } from '../../services/quizService';
import { recordLearningEvent } from '../../services/learningArtifacts';
import type { Quiz } from '../../types/domain';
import './QuizPage.css';

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchChineseQuizzes()
      .then(setQuizzes)
      .catch(() => {
        setLoadError('퀴즈 데이터를 불러오지 못했습니다.');
      });
  }, []);

  if (loadError) {
    return (
      <div className="quiz-state">
        <h2>퀴즈</h2>
        <p>{loadError}</p>
        <button onClick={handleGoHome}>홈으로 돌아가기</button>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return <div className="quiz-loading">퀴즈 데이터를 불러오는 중...</div>;
  }

  const currentQuiz = quizzes[currentIndex] || {};
  const options = currentQuiz.options || { option1: '선택지 없음', option2: '선택지 없음' };
  const progressPercent = ((currentIndex + 1) / quizzes.length) * 100;
  const isCorrectAnswer = selectedAnswer === currentQuiz.result;
  const optionList = [options.option1, options.option2];
  const resultPercent = Math.round((score / quizzes.length) * 100);

  const saveQuizScore = (nextScore: number) => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      const rawStats = window.localStorage.getItem('langpt.chatStats');
      const previousStats = rawStats ? JSON.parse(rawStats) : {};
      window.localStorage.setItem(
        'langpt.chatStats',
        JSON.stringify({
          ...previousStats,
          totalQuizScore: Math.max(previousStats.totalQuizScore ?? 0, nextScore),
          lastQuizScore: nextScore,
          lastQuizSolvedAt: new Date().toISOString(),
        })
      );
      recordLearningEvent({
        type: 'quiz',
        title: '오늘의 퀴즈 완료',
        description: `${nextScore}/${quizzes.length}문제 정답`,
      });
    } catch {
      // 퀴즈 화면은 저장 실패와 관계없이 계속 진행합니다.
    }
  };

  const handleAnswer = (selectedOption: string) => {
    if (answerSelected) return;

    setSelectedAnswer(selectedOption);
    const correctAnswer = currentQuiz.result;
    let nextScore = score;
    if (selectedOption === correctAnswer) {
      nextScore += 1;
      setScore(nextScore);
    }
    setAnswerSelected(true);

    if (currentIndex === quizzes.length - 1) {
      saveQuizScore(nextScore);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswerSelected(false);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswerSelected(false);
    setSelectedAnswer(null);
    setIsFinished(false);
  };

  function handleGoHome() {
    navigate(ROUTES.home);
  }

  if (isFinished) {
    return (
      <main className="quiz-container quiz-result">
        <section className="quiz-result-card">
          <p className="eyebrow">Quiz complete</p>
          <h2>퀴즈 결과</h2>
          <div className="quiz-score-ring" aria-label={`정답률 ${resultPercent}%`}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="quiz-score-ring__track" cx="60" cy="60" r="52" />
              <circle
                className="quiz-score-ring__value"
                cx="60"
                cy="60"
                r="52"
                style={
                  { '--score-offset': 327 - (327 * resultPercent) / 100 } as React.CSSProperties
                }
              />
            </svg>
            <strong>{score}/{quizzes.length}</strong>
            <span>{resultPercent}%</span>
          </div>
          <p className="quiz-result-copy">
            {resultPercent >= 80
              ? '좋아요. 지금 리듬 그대로 다음 표현까지 이어가도 됩니다.'
              : '괜찮아요. 틀린 표현을 한 번 더 말해보면 기억이 훨씬 오래갑니다.'}
          </p>
          <div className="quiz-actions">
            <button type="button" onClick={handleRestart}>다시 풀기</button>
            <button type="button" className="quiz-action-secondary" onClick={handleGoHome}>
              홈으로 돌아가기
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="quiz-container">
      <section className="quiz-hero">
        <div>
          <p className="eyebrow">Quick practice</p>
          <h2>오늘의 퀴즈</h2>
          <p>짧게 풀고 바로 확인하면서 오늘 배운 표현을 굳혀보세요.</p>
        </div>
        <div className="quiz-score-card" aria-label={`현재 점수 ${score}점`}>
          <span>현재 점수</span>
          <strong>{score}</strong>
        </div>
      </section>

      <section className="quiz-shell">
        <div className="quiz-topline">
          <span>문제 {currentIndex + 1} / {quizzes.length}</span>
          <strong>{Math.round(progressPercent)}%</strong>
        </div>
        <div className="quiz-progress" aria-label="퀴즈 진행률">
          <span style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="question-container" key={currentIndex}>
          <div className="question-badge">뜻 맞히기</div>
          <p>{currentQuiz.question}</p>
          <div className="options">
            {optionList.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuiz.result;
              const optionClassName = [
                isSelected ? 'selected-option' : '',
                answerSelected && isCorrect ? 'correct-option' : '',
                answerSelected && isSelected && !isCorrect ? 'wrong-option' : '',
                answerSelected && !isSelected && !isCorrect ? 'muted-option' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={answerSelected}
                  className={optionClassName}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{option}</strong>
                </button>
              );
            })}
          </div>
        </div>

        {answerSelected && (
          <div
            className={`answer-feedback ${isCorrectAnswer ? 'is-correct' : 'is-wrong'}`}
            role="status"
          >
            <strong>{isCorrectAnswer ? '정답입니다' : '다시 체크해볼 표현이에요'}</strong>
            <p>
              {isCorrectAnswer
                ? currentQuiz.explain ?? '좋아요. 정확하게 골랐어요.'
                : `정답은 ${currentQuiz.result}입니다. ${currentQuiz.explain ?? ''}`}
            </p>
          </div>
        )}

        <div className="quiz-actions">
          {answerSelected && (
            <button type="button" onClick={handleNext}>
              {currentIndex < quizzes.length - 1 ? '다음 문제' : '결과 보기'}
            </button>
          )}
          <button type="button" className="quiz-action-secondary" onClick={handleGoHome}>
            홈으로 돌아가기
          </button>
        </div>
      </section>
    </main>
  );
};

export default QuizPage;
