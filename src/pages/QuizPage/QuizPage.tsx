import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import { fetchChineseQuizzes } from '../../services/quizService';
import type { Quiz } from '../../types/domain';
import './QuizPage.css';

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');

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

  const handleAnswer = (selectedOption: string) => {
    if (answerSelected) return;

    setSelectedAnswer(selectedOption);
    const correctAnswer = currentQuiz.result;
    if (selectedOption === correctAnswer) {
      setScore(score + 1);
    }
    setAnswerSelected(true);
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswerSelected(false);
      setSelectedAnswer(null);
    } else {
      alert(`퀴즈 완료! 총 ${score}/${quizzes.length}개의 문제를 맞혔습니다.`);
      setCurrentIndex(0);
      setScore(0);
      setAnswerSelected(false);
      setSelectedAnswer(null);
    }
  };

  function handleGoHome() {
    navigate(ROUTES.home);
  }

  return (
    <div className="quiz-container">
      <h2>퀴즈</h2>
      <div className="question-container">
        <p>{currentQuiz.question}</p>
        <div className="options">
          <button
            onClick={() => handleAnswer(options.option1)}
            disabled={answerSelected}
            className={selectedAnswer === options.option1 ? 'selected-option' : ''}
          >
            {options.option1}
          </button>
          <button
            onClick={() => handleAnswer(options.option2)}
            disabled={answerSelected}
            className={selectedAnswer === options.option2 ? 'selected-option' : ''}
          >
            {options.option2}
          </button>
        </div>
      </div>
      {answerSelected && <button onClick={handleNext}>다음 문제</button>}
      <div className="score">
        <p>현재 점수: {score}</p>
      </div>
      <button onClick={handleGoHome}>홈으로 돌아가기</button>
    </div>
  );
};

export default QuizPage;
