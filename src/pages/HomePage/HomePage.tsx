import React, { useEffect, useMemo, useState } from 'react';
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

type PreviewMessage = {
  id: string;
  sender: 'teacher' | 'student';
  text: string;
};

function HomePage() {
  const previewMessages = useMemo<PreviewMessage[]>(
    () => [
      {
        id: 'greeting',
        sender: 'teacher',
        text: '안녕하세요! 오늘은 把자문을 대화로 연습해볼게요.',
      },
      {
        id: 'try',
        sender: 'student',
        text: '선생님, "I finished my homework"를 중국어로 말해볼게요.',
      },
      {
        id: 'feedback',
        sender: 'teacher',
        text: '좋아요. "我把作业做完了"처럼 말하면 더 자연스러워요.',
      },
      {
        id: 'followup',
        sender: 'student',
        text: '그러면 "I cleaned my room"도 把자문으로 바꿔볼게요.',
      },
    ],
    []
  );

  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.18,
      }
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const currentMessage = previewMessages[activeMessageIndex];

    if (!currentMessage) {
      const resetTimer = window.setTimeout(() => {
        setActiveMessageIndex(0);
        setTypedText('');
      }, 1800);

      return () => window.clearTimeout(resetTimer);
    }

    setTypedText('');
    let characterIndex = 0;
    let typingTimer: number | undefined;
    let nextMessageTimer: number | undefined;

    const startDelay = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        characterIndex += 1;
        setTypedText(currentMessage.text.slice(0, characterIndex));

        if (characterIndex >= currentMessage.text.length) {
          window.clearInterval(typingTimer);
          nextMessageTimer = window.setTimeout(() => {
            setActiveMessageIndex((index) => index + 1);
          }, currentMessage.sender === 'teacher' ? 840 : 620);
        }
      }, currentMessage.sender === 'teacher' ? 28 : 22);
    }, currentMessage.sender === 'teacher' ? 460 : 280);

    return () => {
      window.clearTimeout(startDelay);
      if (typingTimer) {
        window.clearInterval(typingTimer);
      }
      if (nextMessageTimer) {
        window.clearTimeout(nextMessageTimer);
      }
    };
  }, [activeMessageIndex, previewMessages]);

  const completedMessages = previewMessages.slice(0, activeMessageIndex);
  const activeMessage = previewMessages[activeMessageIndex];
  const isChatLoopFinished = activeMessageIndex >= previewMessages.length;

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
            AI 선생님과 대화하며 매일 언어를 연습하세요.
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
            <div className="chat-window__status">
              <span className="status-dot" />
              AI 선생님이 대화를 이어가는 중
            </div>
            <div className="chat-window__body" aria-live="polite">
              {completedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message chat-message--${message.sender}`}
                >
                  {message.text}
                </div>
              ))}
              {activeMessage && (
                <div
                  className={`chat-message chat-message--${activeMessage.sender} chat-message--active`}
                >
                  {typedText || <span className="typing-dots" aria-label="입력 중" />}
                  {typedText && typedText.length < activeMessage.text.length && (
                    <span className="typing-caret" aria-hidden="true" />
                  )}
                </div>
              )}
              {isChatLoopFinished && (
                <div className="chat-message chat-message--teacher chat-message--active">
                  <span className="typing-dots" aria-label="다음 대화 준비 중" />
                </div>
              )}
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

      <section
        id="site-intro"
        className="landing-section landing-section--intro"
        data-reveal
      >
        <div className="landing-section__copy" data-reveal>
          <p className="eyebrow">What LangPT means</p>
          <h2>LangPT의 두 가지 뜻</h2>
          <p>
            AI와 바로 대화하는 언어 연습, 그리고 나에게 맞춘 개인 언어 훈련입니다.
          </p>
        </div>
        <div className="brand-meaning" aria-label="LangPT 브랜드 의미" data-reveal>
          <span>
            <strong>Lang + GPT</strong>
            AI와 대화하며 배우는 언어 학습
          </span>
          <span>
            <strong>Language Personal Training</strong>
            개인에게 맞춘 반복 훈련
          </span>
        </div>
        <div className="feature-grid">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className={`feature-card feature-card--${feature.accent}`}
              data-reveal
              style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--flow" data-reveal>
        <div className="landing-section__copy" data-reveal>
          <p className="eyebrow">Learning flow</p>
          <h2>짧게 시작해서 매일 이어지는 학습 루틴</h2>
        </div>
        <ol className="flow-list">
          {flowSteps.map((step, index) => (
            <li
              key={step}
              data-reveal
              style={{ '--reveal-delay': `${index * 80}ms` } as React.CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-final" data-reveal>
        <h2>오늘 배운 표현을 바로 말해보세요.</h2>
        <Link to={ROUTES.login} className="primary-action">
          로그인하고 시작하기
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
