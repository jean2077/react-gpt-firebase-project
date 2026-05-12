import React, { useState, useEffect } from 'react';
import { saveChatMessage, saveChatStats, subscribeToMessages } from '../../services/chatMessages';
import type { ChatMessage } from '../../types/domain';
import './ChatLog.css';

const ChatLog = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [chatCount, setChatCount] = useState(0); // 채팅 수 상태 관리

    useEffect(() => {
        const unsubscribe = subscribeToMessages((nextMessages) => {
            setMessages(nextMessages);
            setChatCount(nextMessages.length);
        });

        return () => unsubscribe();
    }, []);

    const handleSendMessage = async () => {
        const text = userInput.trim();
        if (text === "") return;

        try {
            await saveChatMessage({
                sender: 'user',
                text,
                timestamp: Date.now(),
            });
            setUserInput('');
        } catch (error) {
            console.error('메시지를 저장하는 중 오류 발생:', error);
        }
    };

    useEffect(() => {
        if (chatCount > 0) {
            saveChatStats(chatCount).catch((error) => {
                console.error('채팅 수 저장 실패:', error);
            });
        }
    }, [chatCount]);

    return (
        <div className="chat-log">
            {/* 채팅 메시지 렌더링 */}
            {messages.map((msg) => (
                <div key={msg.id ?? `${msg.timestamp}-${msg.text}`} className={`chat-message ${msg.sender}`}>
                    <strong>{msg.sender === 'bot' ? '메이린' : msg.sender}:</strong> {msg.text}
                </div>
            ))}

            {/* 사용자 메시지 입력 */}
            <div className="chat-input-section">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="chat-input"
                />
                <button onClick={handleSendMessage} className="send-button">전송</button>
            </div>

            {/* 채팅 수 출력 */}
            <div className="chat-stats">
                <h3>채팅 수: {chatCount}</h3>
            </div>
        </div>
    );
};

export default ChatLog;
