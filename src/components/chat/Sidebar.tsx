import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import ChatLog from './ChatLog';
import './Sidebar.css';

interface SidebarProps {
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ setIsSidebarOpen }: SidebarProps) => {
    const navigate = useNavigate();

    // 마이페이지로 이동하는 함수 수정
    const handleHomeClick = () => {
        navigate(ROUTES.stats);
    };

    const handleNewChatClick = () => {
        navigate(ROUTES.onboarding);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>내 계정</h2>
                <button className="new-chat-button" onClick={handleNewChatClick}>새 채팅</button>
                <button className="close-button" onClick={() => setIsSidebarOpen(false)}>닫기</button>
            </div>
            <ChatLog />
            {/* 마이페이지 버튼 클릭 시 /stats로 리다이렉트 */}
            <button className="home-button" onClick={handleHomeClick}>마이 페이지</button>
        </div>
    );
};

export default Sidebar;
