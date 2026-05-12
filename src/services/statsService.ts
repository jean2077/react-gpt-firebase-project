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

export const fetchUserStats = async (_userId: string): Promise<UserStats | null> => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return DEFAULT_STATS;
  }

  try {
    const rawStats = window.localStorage.getItem(CHAT_STATS_KEY);
    const chatStats = rawStats
      ? (JSON.parse(rawStats) as { totalChatCount?: number })
      : null;

    return {
      ...DEFAULT_STATS,
      weeklyChatCount: chatStats?.totalChatCount ?? DEFAULT_STATS.weeklyChatCount,
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
