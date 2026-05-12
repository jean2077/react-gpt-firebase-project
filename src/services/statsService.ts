import type { UserStats } from '../types/domain';
import { localQuotes } from '../data/localStats';

export const DEFAULT_STATS: UserStats = {
  weeklyChatCount: 0,
  dailyAvgStudyTime: 0,
  dailyTotalTime: 0,
  totalQuizScore: 0,
  totalLoginTime: 0,
};

const CHAT_STATS_KEY = 'langpt.chatStats';
const CHAT_MESSAGES_KEY = 'langpt.chatMessages';

interface StoredChatStats {
  dailyTotalTime?: number;
  totalChatCount?: number;
  totalLoginTime?: number;
  totalQuizScore?: number;
}

const readJson = <T>(key: string): T | null => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
};

export const fetchUserStats = async (_userId: string): Promise<UserStats | null> => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return DEFAULT_STATS;
  }

  try {
    const chatStats = readJson<StoredChatStats>(CHAT_STATS_KEY);
    const chatMessages = readJson<Array<{ sender?: string }>>(CHAT_MESSAGES_KEY) ?? [];
    const userMessageCount = chatMessages.filter((message) => message.sender === 'user').length;
    const totalChatCount = Math.max(chatStats?.totalChatCount ?? 0, userMessageCount);
    const estimatedStudyMinutes = totalChatCount * 4;
    const dailyTotalTime = Math.max(chatStats?.dailyTotalTime ?? 0, estimatedStudyMinutes);

    return {
      ...DEFAULT_STATS,
      weeklyChatCount: totalChatCount,
      dailyAvgStudyTime: Math.round(dailyTotalTime / 7),
      dailyTotalTime,
      totalQuizScore: chatStats?.totalQuizScore ?? DEFAULT_STATS.totalQuizScore,
      totalLoginTime: chatStats?.totalLoginTime ?? DEFAULT_STATS.totalLoginTime,
    };
  } catch {
    return DEFAULT_STATS;
  }
};

export const fetchRandomQuote = async (): Promise<string> => {
  if (localQuotes.length === 0) {
    return '';
  }

  const randomIndex = Math.floor(Math.random() * localQuotes.length);
  return localQuotes[randomIndex];
};
