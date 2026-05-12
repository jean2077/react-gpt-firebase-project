import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import './HomePage.css';

type FeatureAccent = 'blue' | 'teal' | 'coral';

interface FeatureCard {
  title: string;
  description: string;
  accent: FeatureAccent;
}

const featureCards: FeatureCard[] = [
  {
    title: '대화로 바로 연습',
    description: '문법 설명에서 멈추지 않고, 배운 표현을 채팅 상황 안에서 곧바로 써봅니다.',
    accent: 'blue',
  },
  {
    title: '선생님 톤 선택',
    description: '차분한 교정, 친근한 회화, 시험 대비처럼 학습 목적에 맞는 대화 스타일을 고릅니다.',
    accent: 'teal',
  },
  {
    title: '학습 흐름 기록',
    description: '퀴즈와 통계 화면으로 오늘 배운 내용과 반복해야 할 지점을 빠르게 확인합니다.',
    accent: 'coral',
  },
];

const flowSteps = [
  '오늘 배울 표현을 확인합니다.',
  'AI 선생님과 짧은 대화를 시작합니다.',
  '틀린 문장과 더 자연스러운 표현을 바로 고칩니다.',
  '퀴즈와 기록으로 복습 루틴을 만듭니다.',
];

function HomePage() {
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-label="LangPT 소개">
        <div className="landing-hero__background" aria-hidden="true">
          <div className="landing-hero__blur-sheet landing-hero__blur-sheet--one" />
          <div className="landing-hero__blur-sheet landing-hero__blur-sheet--two" />
          <div className="landing-hero__grid" />
        </div>

        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow">AI language practice</p>
          <h1 className="landing-hero__title">LangPT</h1>
          <p className="landing-hero__copy">
            영어와 중국어를 설명으로만 외우지 않고, 실제 대화처럼 말하고 고쳐보는
            언어 학습 공간입니다.
          </p>
          <div className="landing-hero__actions">
            <Link to={ROUTES.login} className="long_rectangle_mp">
              <span className="long_in_rectangle_mp">여기를 눌러 무료로 이용해보세요.</span>
            </Link>
            <a href="#site-intro" className="landing-hero__secondary">
              서비스 살펴보기
            </a>
          </div>
        </div>

        <div className="landing-hero__visual" aria-label="채팅 미리보기">
          <div className="chat-window">
            <div className="chat-window__toolbar">
              <span />
              <span />
              <span />
            </div>
            <div className="chat-window__body">
              <div className="chat-message chat-message--teacher">
                안녕하세요! 오늘은 把자문을 대화로 연습해볼게요.
              </div>
              <div className="chat-message chat-message--student">
                선생님, "I finished my homework"를 중국어로 말해볼게요.
              </div>
              <div className="chat-message chat-message--teacher chat-message--feedback">
                좋아요. 문장 구조를 자연스럽게 바꾸면 더 매끄러워져요.
              </div>
            </div>
            <div className="chat-window__composer">
              <span>오늘 배운 문장으로 답장하기</span>
              <strong>↵</strong>
            </div>
          </div>
        </div>

        <a href="#site-intro" className="landing-hero__scroll">
          아래로 스크롤
        </a>
      </section>

      <section id="site-intro" className="landing-section landing-section--intro">
        <div className="landing-section__copy">
          <p className="eyebrow">What LangPT does</p>
          <h2>혼자 공부할 때 비어 있던 대화 시간을 채워줍니다.</h2>
          <p>
            LangPT는 문법, 회화, 퀴즈, 학습 기록을 하나의 흐름으로 묶습니다. 사용자는
            선생님을 고르고, 바로 채팅하고, 배운 내용을 다시 확인할 수 있습니다.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className={`feature-card feature-card--${feature.accent}`}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--flow">
        <div className="landing-section__copy">
          <p className="eyebrow">Learning flow</p>
          <h2>짧게 시작해서 매일 이어지는 학습 루틴</h2>
        </div>
        <ol className="flow-list">
          {flowSteps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-final">
        <h2>오늘 배운 표현을 바로 말해보세요.</h2>
        <Link to={ROUTES.login} className="primary-action">
          로그인하고 시작하기
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
