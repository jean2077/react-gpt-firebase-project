import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Link 컴포넌트 임포트
import { ROUTES } from '../../app/routes';
import './OnboardingPage.css';

function OnboardingPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null); // 선택된 선생님 상태

  const handleTeacherClick = (teacher: string) => {
    setSelectedTeacher(teacher); // 클릭된 선생님으로 상태 업데이트
  };

  return (
    <div className="FirstNewLogin">
      <div className="hello_new_login">안녕하세요! hello! 你好！</div>
      <div className="chat_ractangle"></div>
      <div className="ballon_left">
        안녕하세요 혜성학생 오늘은 중국어의 把자문에 대해 알아보겠어요.
      </div>
      <div className="ballon_right">안녕하세요 선생님!</div>

      {/* 선생님 선택 영역 */}
      <div className="teacher-selection">
        <div
          className={`teacher ${selectedTeacher === "메이린" ? "selected" : ""}`}
          onClick={() => handleTeacherClick("메이린")}
        >
          엄격하지만 다정한 선생님 "메이린"
        </div>
        <div
          className={`teacher ${selectedTeacher === "제이크" ? "selected" : ""}`}
          onClick={() => handleTeacherClick("제이크")}
        >
          해외에서 오래 살다온 "제이크"
        </div>
        <div
          className={`teacher ${selectedTeacher === "푸바오" ? "selected" : ""}`}
          onClick={() => handleTeacherClick("푸바오")}
        >
          장난끼 많은 귀여운 판다 "푸바오"
        </div>

        <Link
          to={selectedTeacher ? ROUTES.chat : "#"}
          state={selectedTeacher ? { teacherName: selectedTeacher } : {}}
          className={`start ${selectedTeacher ? '' : 'start-disabled'}`}
        >
          여기를 눌러 즐거운 언어학습을 시작해볼까요?
        </Link>
      </div>
    </div>
  );
}

export default OnboardingPage;
