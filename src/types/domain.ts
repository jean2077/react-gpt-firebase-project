export type ChatSender = 'user' | 'bot';

export type LearningLanguage = 'chinese' | 'english' | 'japanese';

export type TeacherProfileId =
  | 'meilin'
  | 'haoyu'
  | 'lin'
  | 'jake'
  | 'emma'
  | 'noah'
  | 'sora'
  | 'yuna'
  | 'ren';

export interface TeacherProfile {
  id: TeacherProfileId;
  language: LearningLanguage;
  name: string;
  specialty: string;
  tone: string;
  personality: string;
  description: string;
  promptGuide: string;
}

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

export type BoardPostCategory = 'english' | 'chinese' | 'japanese';

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: BoardPostCategory;
  createdAt: string;
  viewCount: number;
}

export type LearningPresetId =
  | 'conversation'
  | 'grammar'
  | 'correction'
  | 'exam'
  | 'business';

export interface LearningPreset {
  id: LearningPresetId;
  label: string;
  description: string;
  promptGuide: string;
}

export interface SavedExpression {
  id: string;
  text: string;
  note: string;
  language: LearningLanguage;
  teacherName: string;
  source: 'chat' | 'manual';
  createdAt: string;
  reviewCount: number;
  lastReviewedAt?: string;
}

export type LearningEventType = 'chat' | 'quiz' | 'expression' | 'level';

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  title: string;
  description: string;
  createdAt: string;
}

export interface DailyLearningGoals {
  sentenceGoal: number;
  quizGoal: number;
  expressionGoal: number;
}

export type LevelResult = 'beginner' | 'intermediate' | 'advanced';

export interface LevelTestResult {
  level: LevelResult;
  score: number;
  total: number;
  createdAt: string;
}
