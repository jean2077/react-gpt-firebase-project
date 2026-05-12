import React, { useMemo, useState } from 'react';
import { languageLabels } from '../../data/teacherProfiles';
import {
  deleteExpression,
  getSavedExpressions,
  reviewExpression,
  saveExpression,
} from '../../services/learningArtifacts';
import type { LearningLanguage } from '../../types/domain';
import './VocabularyPage.css';

const languageOptions = Object.entries(languageLabels) as Array<[LearningLanguage, string]>;

function VocabularyPage() {
  const [expressions, setExpressions] = useState(() => getSavedExpressions());
  const [activeLanguage, setActiveLanguage] = useState<LearningLanguage | 'all'>('all');
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [language, setLanguage] = useState<LearningLanguage>('english');

  const filteredExpressions = useMemo(
    () =>
      activeLanguage === 'all'
        ? expressions
        : expressions.filter((expression) => expression.language === activeLanguage),
    [activeLanguage, expressions]
  );

  const handleAddExpression = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) return;

    saveExpression({
      text,
      note,
      language,
      teacherName: '직접 추가',
      source: 'manual',
    });
    setExpressions(getSavedExpressions());
    setText('');
    setNote('');
  };

  const handleReview = (expressionId: string) => {
    reviewExpression(expressionId);
    setExpressions(getSavedExpressions());
  };

  const handleDelete = (expressionId: string) => {
    deleteExpression(expressionId);
    setExpressions(getSavedExpressions());
  };

  return (
    <main className="vocabulary-page">
      <section className="vocabulary-hero">
        <div>
          <p className="eyebrow">Saved expressions</p>
          <h1>단어장</h1>
          <p>채팅에서 저장한 문장과 직접 추가한 표현을 언어별로 복습하세요.</p>
        </div>
        <div className="vocabulary-count">
          <strong>{expressions.length}</strong>
          <span>저장한 표현</span>
        </div>
      </section>

      <section className="vocabulary-toolbar" aria-label="단어장 필터">
        <button
          type="button"
          className={activeLanguage === 'all' ? 'vocabulary-filter--active' : ''}
          onClick={() => setActiveLanguage('all')}
        >
          전체
        </button>
        {languageOptions.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeLanguage === key ? 'vocabulary-filter--active' : ''}
            onClick={() => setActiveLanguage(key)}
          >
            {label}
          </button>
        ))}
      </section>

      <section className="vocabulary-layout">
        <div className="vocabulary-list" aria-label="저장한 표현 목록">
          {filteredExpressions.map((expression) => (
            <article key={expression.id} className="vocabulary-card">
              <div className="vocabulary-card__topline">
                <span>{languageLabels[expression.language]}</span>
                <small>{new Date(expression.createdAt).toLocaleDateString('ko-KR')}</small>
              </div>
              <p>{expression.text}</p>
              {expression.note && <em>{expression.note}</em>}
              <div className="vocabulary-card__actions">
                <button type="button" onClick={() => handleReview(expression.id)}>
                  복습 완료 {expression.reviewCount}
                </button>
                <button type="button" className="vocabulary-card__delete" onClick={() => handleDelete(expression.id)}>
                  삭제
                </button>
              </div>
            </article>
          ))}

          {filteredExpressions.length === 0 && (
            <div className="vocabulary-empty">
              <strong>아직 저장한 표현이 없습니다.</strong>
              <p>채팅 메시지의 표현 저장 버튼을 누르거나 직접 표현을 추가해보세요.</p>
            </div>
          )}
        </div>

        <form className="vocabulary-form" onSubmit={handleAddExpression}>
          <p className="eyebrow">Quick add</p>
          <h2>직접 표현 추가</h2>
          <label>
            언어
            <select value={language} onChange={(event) => setLanguage(event.target.value as LearningLanguage)}>
              {languageOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            표현
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="예: Could you say that again?"
              rows={5}
            />
          </label>
          <label>
            메모
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="상황, 뜻, 발음 팁"
            />
          </label>
          <button type="submit">단어장에 추가</button>
        </form>
      </section>
    </main>
  );
}

export default VocabularyPage;
