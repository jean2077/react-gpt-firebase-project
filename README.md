# LangPT

LangPT는 영어와 중국어를 대화 흐름으로 연습하는 React 프론트엔드 앱입니다.

## 실행

```bash
npm install
npm start
```

개발 서버는 Vite로 실행되며 기본 포트는 `3000`입니다.

## 주요 스크립트

```bash
npm start       # Vite 개발 서버 실행
npm run build   # 프로덕션 빌드
npm test        # Vitest 테스트 실행
npm run typecheck
```

## 현재 구조

- `src/app`: 라우터와 앱 진입 설정
- `src/pages`: URL 단위 화면
- `src/components`: 재사용 UI 컴포넌트
- `src/services`: 프론트 전용 인증, 채팅, 퀴즈, 통계 로직
- `src/data`: 로컬 샘플 데이터
- `src/assets`: 브랜드 이미지와 정적 에셋
