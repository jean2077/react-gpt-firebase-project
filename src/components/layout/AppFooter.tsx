import React from 'react';
import langptLogo from '../../assets/brand/langpt-logo.png';
import './AppFooter.css';

type FooterIconName = 'chat' | 'target' | 'save';

const footerHighlights: Array<{
  title: string;
  description: string;
  icon: FooterIconName;
}> = [
  {
    title: 'AI 채팅',
    description: '선생님을 고르고 바로 회화 연습',
    icon: 'chat',
  },
  {
    title: '오늘의 퀴즈',
    description: '오늘 배운 표현을 짧게 복습',
    icon: 'target',
  },
  {
    title: '표현 저장',
    description: '다시 보고 싶은 문장을 단어장에 저장',
    icon: 'save',
  },
];

function FooterIcon({ name }: { name: FooterIconName }) {
  if (name === 'chat') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="app-footer__icon-svg">
        <path d="M5 6.7C5 5.2 6.2 4 7.7 4h8.6C17.8 4 19 5.2 19 6.7v5.4c0 1.5-1.2 2.7-2.7 2.7h-4.9l-4 3.2v-3.2C6 14.7 5 13.5 5 12.1V6.7Z" />
        <path d="M8.4 8.4h7.2M8.4 11h4.8" />
      </svg>
    );
  }

  if (name === 'target') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="app-footer__icon-svg">
        <path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8Z" />
        <path d="M12 16.2A4.2 4.2 0 1 0 7.8 12 4.2 4.2 0 0 0 12 16.2Z" />
        <path d="M12 12h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="app-footer__icon-svg">
      <path d="M7 5.8C7 4.8 7.8 4 8.8 4h6.4C16.2 4 17 4.8 17 5.8V20l-5-3-5 3V5.8Z" />
      <path d="M10 8h4" />
    </svg>
  );
}

function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <section className="app-footer__brand" aria-label="LangPT 소개">
          <img src={langptLogo} alt="LangPT" className="app-footer__logo" />
          <p>Language Personal Training을 위한 AI 언어 학습 공간</p>
        </section>

        <section className="app-footer__highlights" aria-label="학습 기능 요약">
          {footerHighlights.map((item) => (
            <div key={item.title} className="app-footer__highlight">
              <span className="app-footer__icon">
                <FooterIcon name={item.icon} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            </div>
          ))}
        </section>

        <section className="app-footer__meta" aria-label="브랜드 정보">
          <small>© {currentYear} LangPT</small>
          <span>English · Chinese · Japanese</span>
        </section>
      </div>
    </footer>
  );
}

export default AppFooter;
