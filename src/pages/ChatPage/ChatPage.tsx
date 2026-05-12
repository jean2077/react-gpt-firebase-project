import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/chat/Sidebar';
import {
    DEFAULT_TEACHER_PROFILE,
    getTeachersByLanguage,
    languageLabels,
    teacherProfiles,
} from '../../data/teacherProfiles';
import { DEFAULT_LEARNING_PRESET, learningPresets } from '../../data/learningPresets';
import { requestChatReply } from '../../services/chatApi';
import { saveChatMessage } from '../../services/chatMessages';
import { recordLearningEvent, saveExpression } from '../../services/learningArtifacts';
import type {
    ChatMessage,
    ChatMessageInput,
    LearningLanguage,
    LearningPresetId,
    TeacherProfileId,
} from '../../types/domain';
import './ChatPage.css';

type SetupStep = 'language' | 'teacher' | 'preset' | 'ready';

type SpeechRecognitionResultEventLike = {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

const TEACHER_STORAGE_KEY = 'langpt.selectedTeacher';
const LANGUAGE_STORAGE_KEY = 'langpt.selectedLanguage';
const PRESET_STORAGE_KEY = 'langpt.selectedPreset';
const languageOptions = Object.entries(languageLabels) as Array<[LearningLanguage, string]>;

const getSavedTeacherId = (): TeacherProfileId => {
    if (typeof window === 'undefined') {
        return DEFAULT_TEACHER_PROFILE.id;
    }

    const savedTeacherId = window.localStorage.getItem(TEACHER_STORAGE_KEY);
    const profile = teacherProfiles.find((teacher) => teacher.id === savedTeacherId);
    return profile?.id ?? DEFAULT_TEACHER_PROFILE.id;
};

const getSavedLanguage = (): LearningLanguage => {
    if (typeof window === 'undefined') {
        return DEFAULT_TEACHER_PROFILE.language;
    }

    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && savedLanguage in languageLabels) {
        return savedLanguage as LearningLanguage;
    }

    const savedTeacher = teacherProfiles.find(
        (teacher) => teacher.id === window.localStorage.getItem(TEACHER_STORAGE_KEY)
    );
    return savedTeacher?.language ?? DEFAULT_TEACHER_PROFILE.language;
};

const getSavedPresetId = (): LearningPresetId => {
    if (typeof window === 'undefined') {
        return DEFAULT_LEARNING_PRESET.id;
    }

    const savedPresetId = window.localStorage.getItem(PRESET_STORAGE_KEY);
    const profile = learningPresets.find((preset) => preset.id === savedPresetId);
    return profile?.id ?? DEFAULT_LEARNING_PRESET.id;
};

const getDefaultTeacherIdByLanguage = (language: LearningLanguage): TeacherProfileId =>
    getTeachersByLanguage(language)[0]?.id ?? DEFAULT_TEACHER_PROFILE.id;

const getSpeechLanguage = (language: LearningLanguage) => {
    if (language === 'english') return 'en-US';
    if (language === 'japanese') return 'ja-JP';
    return 'zh-CN';
};

const getMessageKey = (message: ChatMessage, index: number) =>
    message.id ?? `${message.sender}-${message.timestamp}-${index}`;

function ChatPage() {
    const [selectedLanguage, setSelectedLanguage] = useState<LearningLanguage>(getSavedLanguage);
    const [selectedTeacherId, setSelectedTeacherId] = useState<TeacherProfileId>(getSavedTeacherId);
    const [selectedPresetId, setSelectedPresetId] = useState<LearningPresetId>(getSavedPresetId);
    const [isChatStarted, setIsChatStarted] = useState(false);
    const [setupStep, setSetupStep] = useState<SetupStep>('language');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [savedMessageKeys, setSavedMessageKeys] = useState<Set<string>>(() => new Set());
    const [toastMessage, setToastMessage] = useState('');
    const [speechStatus, setSpeechStatus] = useState('');

    const chatLogRef = useRef<HTMLDivElement | null>(null);
    const currentTeachers = getTeachersByLanguage(selectedLanguage);
    const selectedTeacher =
        currentTeachers.find((teacher) => teacher.id === selectedTeacherId) ??
        currentTeachers[0] ??
        DEFAULT_TEACHER_PROFILE;
    const selectedPreset =
        learningPresets.find((preset) => preset.id === selectedPresetId) ??
        DEFAULT_LEARNING_PRESET;
    const teacherName = selectedTeacher.name;

    const handleOpenSidebar = () => {
        setIsSidebarOpen(true);
    };

    const handleLanguageSelect = (language: LearningLanguage) => {
        const nextTeacherId = getDefaultTeacherIdByLanguage(language);
        setSelectedLanguage(language);
        setSelectedTeacherId(nextTeacherId);
        setSetupStep('teacher');
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        window.localStorage.setItem(TEACHER_STORAGE_KEY, nextTeacherId);
    };

    const handleTeacherSelect = (teacherId: TeacherProfileId) => {
        setSelectedTeacherId(teacherId);
        setSetupStep('preset');
        window.localStorage.setItem(TEACHER_STORAGE_KEY, teacherId);
    };

    const handlePresetSelect = (presetId: LearningPresetId) => {
        setSelectedPresetId(presetId);
        setSetupStep('ready');
        window.localStorage.setItem(PRESET_STORAGE_KEY, presetId);
    };

    const handleStartLearning = () => {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
        window.localStorage.setItem(TEACHER_STORAGE_KEY, selectedTeacher.id);
        window.localStorage.setItem(PRESET_STORAGE_KEY, selectedPreset.id);
        setSelectedTeacherId(selectedTeacher.id);
        setMessages([
            {
                sender: 'bot',
                text: `안녕하세요. ${teacherName}입니다. 오늘은 ${languageLabels[selectedLanguage]} ${selectedPreset.label} 모드로 가볍게 시작해볼게요. 지금 하고 싶은 말을 한 문장만 보내주세요.`,
                timestamp: Date.now(),
            },
        ]);
        setIsChatStarted(true);
    };

    const handleSendMessage = async () => {
        const text = userInput.trim();
        if (text === '') return;

        const timestamp = Date.now();
        const userMessage: ChatMessageInput = { sender: 'user', text, timestamp };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setUserInput('');

        try {
            await saveChatMessage(userMessage);
            recordLearningEvent({
                type: 'chat',
                title: `${selectedPreset.label} 채팅`,
                description: text,
            });

            const replyText = await requestChatReply(text, selectedTeacher, selectedPreset);
            const botMessage: ChatMessageInput = {
                sender: 'bot',
                text: replyText,
                timestamp: Date.now(),
            };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
            await saveChatMessage(botMessage);
        } catch (error) {
            console.error('Error calling GPT API:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: 'bot',
                    text: '죄송합니다. 답변을 불러오지 못했어요. 다시 시도해 주세요.',
                    timestamp: Date.now(),
                },
            ]);
        }
    };

    const handleSaveExpression = (message: ChatMessage, index: number) => {
        const text = message.text.trim();
        if (!text) return;

        const key = getMessageKey(message, index);
        saveExpression({
            text,
            note: `${teacherName} 선생님 · ${selectedPreset.label}`,
            language: selectedLanguage,
            teacherName,
            source: 'chat',
        });
        setSavedMessageKeys((previousKeys) => new Set(previousKeys).add(key));
        setToastMessage('단어장에 저장했어요.');
    };

    const handleSpeechInput = () => {
        const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechStatus('이 브라우저는 음성 입력을 지원하지 않아요.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = getSpeechLanguage(selectedLanguage);
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript ?? '')
                .join(' ')
                .trim();

            if (transcript) {
                setUserInput(transcript);
                setSpeechStatus('음성을 문장으로 옮겼어요.');
            }
        };
        recognition.onerror = () => setSpeechStatus('음성을 인식하지 못했어요.');
        recognition.onend = () => {
            window.setTimeout(() => setSpeechStatus(''), 1800);
        };
        setSpeechStatus('듣고 있어요. 문장을 말해보세요.');
        recognition.start();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!toastMessage) return undefined;
        const timer = window.setTimeout(() => setToastMessage(''), 1800);
        return () => window.clearTimeout(timer);
    }, [toastMessage]);

    if (!isChatStarted) {
        return (
            <main className="MainChatPage chat-setup-mode">
                <section className="chat-setup">
                    <div className="chat-setup__intro">
                        <p className="eyebrow">Start with a teacher</p>
                        <h1>대화하듯 학습을 시작해볼까요?</h1>
                        <p>언어, 선생님, 학습 모드를 답장처럼 고르면 바로 채팅이 열려요.</p>
                    </div>

                    <div className="setup-chat-thread" aria-label="채팅 학습 준비">
                        <div className="setup-chat-bubble setup-chat-bubble--bot">
                            <strong>LangPT</strong>
                            <p>먼저 어떤 언어로 대화 연습을 시작할까요?</p>
                        </div>

                        <div className="setup-reply-group language-selector" aria-label="학습 언어 선택">
                            {languageOptions.map(([language, label]) => (
                                <button
                                    key={language}
                                    type="button"
                                    className={`language-chip${
                                        selectedLanguage === language ? ' language-chip--active' : ''
                                    }`}
                                    onClick={() => handleLanguageSelect(language)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {setupStep !== 'language' && (
                            <>
                                <div className="setup-chat-bubble setup-chat-bubble--user">
                                    <p>{languageLabels[selectedLanguage]}로 연습할게요.</p>
                                </div>

                                <div className="setup-chat-bubble setup-chat-bubble--bot">
                                    <strong>LangPT</strong>
                                    <p>좋아요. 오늘 대화 스타일에 맞는 AI 선생님을 골라주세요.</p>
                                </div>

                                <div className="setup-teacher-grid" aria-label="AI 선생님 선택">
                                    {currentTeachers.map((teacher) => (
                                        <button
                                            key={teacher.id}
                                            type="button"
                                            className={`setup-teacher-card${
                                                teacher.id === selectedTeacher.id ? ' setup-teacher-card--active' : ''
                                            }`}
                                            onClick={() => handleTeacherSelect(teacher.id)}
                                        >
                                            <span className="teacher-check" aria-hidden="true">
                                                {teacher.id === selectedTeacher.id ? '✓' : ''}
                                            </span>
                                            <strong>{teacher.name}</strong>
                                            <span>{teacher.specialty}</span>
                                            <small>{teacher.personality}</small>
                                            <p>{teacher.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {(setupStep === 'preset' || setupStep === 'ready') && (
                            <>
                                <div className="setup-chat-bubble setup-chat-bubble--user">
                                    <p>{teacherName} 선생님과 할게요.</p>
                                </div>

                                <div className="setup-chat-bubble setup-chat-bubble--bot">
                                    <strong>LangPT</strong>
                                    <p>마지막으로 오늘 어떤 방식으로 말해볼지 골라주세요.</p>
                                </div>

                                <div className="setup-preset-grid" aria-label="학습 모드 선택">
                                    {learningPresets.map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            className={`setup-preset-card${
                                                preset.id === selectedPreset.id ? ' setup-preset-card--active' : ''
                                            }`}
                                            onClick={() => handlePresetSelect(preset.id)}
                                        >
                                            <strong>{preset.label}</strong>
                                            <p>{preset.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {setupStep === 'ready' && (
                            <>
                                <div className="setup-chat-bubble setup-chat-bubble--user">
                                    <p>{selectedPreset.label} 모드로 시작할래요.</p>
                                </div>

                                <div className="setup-chat-bubble setup-chat-bubble--bot setup-chat-bubble--summary">
                                    <strong>{teacherName} 선생님 · {selectedPreset.label}</strong>
                                    <p>{selectedTeacher.description}</p>
                                    <span>{selectedPreset.description}</span>
                                </div>

                                <button type="button" className="start-learning-button" onClick={handleStartLearning}>
                                    채팅 학습 시작하기
                                </button>
                            </>
                        )}
                    </div>
                </section>
            </main>
        );
    }

    return (
        <div className="MainChatPage chat-active">
            <section className={`chat-page-header ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div>
                    <p className="eyebrow">{languageLabels[selectedLanguage]} AI teacher</p>
                    <h1 className="chat-page-title">{teacherName} 선생님과의 채팅</h1>
                    <p className="teacher-description">{selectedTeacher.description}</p>
                    <div className="chat-mode-panel" aria-label="채팅 학습 모드">
                        {learningPresets.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                className={`mode-chip${preset.id === selectedPreset.id ? ' mode-chip--active' : ''}`}
                                onClick={() => {
                                    setSelectedPresetId(preset.id);
                                    window.localStorage.setItem(PRESET_STORAGE_KEY, preset.id);
                                }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    className="change-teacher-button"
                    onClick={() => {
                        setSetupStep('language');
                        setIsChatStarted(false);
                    }}
                >
                    선생님 다시 선택
                </button>
            </section>

            {isSidebarOpen && <Sidebar setIsSidebarOpen={setIsSidebarOpen} />}

            {!isSidebarOpen && (
                <button className="open-sidebar-button" onClick={handleOpenSidebar}>
                    사이드바 열기
                </button>
            )}

            <div className={`chat_ractangle_mainChat ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="chat-log_main" ref={chatLogRef}>
                    {messages.map((message, index) => {
                        const messageKey = getMessageKey(message, index);
                        const isSaved = savedMessageKeys.has(messageKey);

                        return (
                            <div
                                key={messageKey}
                                className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                <div className="message-meta">
                                    <strong>{message.sender === 'bot' ? `${teacherName} 선생님` : '사용자'}</strong>
                                    <span className="timestamp">
                                        {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <p className="message-text">{message.text}</p>
                                <button
                                    type="button"
                                    className="save-expression-button"
                                    onClick={() => handleSaveExpression(message, index)}
                                    disabled={isSaved}
                                >
                                    {isSaved ? '저장됨' : '표현 저장'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {toastMessage && <div className="chat-toast">{toastMessage}</div>}

                <div className="chat-input-section">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(event) => setUserInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            selectedPreset.id === 'correction'
                                ? '첨삭받을 문장을 입력하세요...'
                                : '메시지를 입력하세요...'
                        }
                        className="chat-input"
                    />
                    <button type="button" onClick={handleSpeechInput} className="voice-button">
                        말하기
                    </button>
                    <button type="button" onClick={handleSendMessage} className="send-button">
                        전송
                    </button>
                </div>
                {speechStatus && <p className="speech-status">{speechStatus}</p>}
            </div>
        </div>
    );
}

export default ChatPage;
