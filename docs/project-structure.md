# Project Structure

이 프로젝트는 React 앱 코드를 역할별로 나눠 관리합니다.

## src

- `app/`: 앱 진입점, 라우트 상수, 라우터 설정
- `pages/`: URL에 직접 연결되는 화면 단위 컴포넌트
- `components/`: 여러 화면에서 재사용 가능한 UI 컴포넌트
- `services/`: Firebase, GPT API, Firestore/Realtime Database 접근 코드
- `data/seed/`: Firestore에 샘플 데이터를 넣는 수동 실행용 스크립트

## docs

- 앱 런타임에 포함되지 않는 문서와 수동 확인용 파일을 둡니다.

## 규칙

- 화면 컴포넌트에서는 가능한 한 Firebase/HTTP 세부 구현을 직접 다루지 않고 `services/` 함수를 호출합니다.
- 새 라우트 경로는 `src/app/routes.js`에 먼저 추가한 뒤 사용합니다.
- 앱 화면에 포함되지 않는 테스트 HTML이나 참고 자료는 `src/`가 아니라 `docs/`에 둡니다.
