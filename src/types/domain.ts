export type ChatSender = 'user' | 'bot';

export interface ChatMessage {
  id?: string;
  sender: ChatSender;
  text: string;
  timestamp: number;
}

export type ChatMessageInput = Omit<ChatMessage, 'id'>;

export interface QuizOptions {
  option1: string;
  option2: string;
}

export interface Quiz {
  explain?: string;
  options: QuizOptions;
  question: string;
  result: string;
}

export interface UserStats {
  weeklyChatCount: number;
  dailyAvgStudyTime: number;
  dailyTotalTime: number;
  totalQuizScore: number;
  totalLoginTime: number;
}

export type LocalAuthProvider = 'demo' | 'local';

export interface StoredLocalAuthUser {
  id: string;
  email: string;
  nickname: string;
  provider: LocalAuthProvider;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
  passwordResetAt?: string;
}

export type LocalAuthUser = Omit<StoredLocalAuthUser, 'passwordHash'>;

export interface LocalAuthSession {
  user: LocalAuthUser;
  authenticatedAt: string;
}
