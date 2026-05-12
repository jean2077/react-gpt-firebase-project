import type { ChatMessage, ChatMessageInput } from '../types/domain';

const CHAT_MESSAGES_KEY = 'langpt.chatMessages';
const CHAT_STATS_KEY = 'langpt.chatStats';
const CHAT_MESSAGES_EVENT = 'langpt-chat-messages-change';

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readMessages = (): ChatMessage[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const value = window.localStorage.getItem(CHAT_MESSAGES_KEY);
    return value ? (JSON.parse(value) as ChatMessage[]) : [];
  } catch {
    return [];
  }
};

const writeMessages = (messages: ChatMessage[]): void => {
  if (!canUseStorage()) {
    return;
  }

  const previousStats = (() => {
    try {
      const value = window.localStorage.getItem(CHAT_STATS_KEY);
      return value ? (JSON.parse(value) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  })();
  const userMessageCount = messages.filter((message) => message.sender === 'user').length;

  window.localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  window.localStorage.setItem(
    CHAT_STATS_KEY,
    JSON.stringify({
      ...previousStats,
      totalChatCount: userMessageCount,
      dailyTotalTime: userMessageCount * 4,
      lastUpdated: new Date().toISOString(),
    })
  );
  window.dispatchEvent(new Event(CHAT_MESSAGES_EVENT));
};

export const subscribeToMessages = (
  onMessages: (messages: ChatMessage[]) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    onMessages([]);
    return () => {};
  }

  const handleMessagesChange = () => onMessages(readMessages());
  window.addEventListener(CHAT_MESSAGES_EVENT, handleMessagesChange);
  window.addEventListener('storage', handleMessagesChange);
  handleMessagesChange();

  return () => {
    window.removeEventListener(CHAT_MESSAGES_EVENT, handleMessagesChange);
    window.removeEventListener('storage', handleMessagesChange);
  };
};

export const saveChatMessage = async (message: ChatMessageInput): Promise<void> => {
  const nextMessage: ChatMessage = {
    ...message,
    id: `local-message-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };

  writeMessages([...readMessages(), nextMessage]);
};

export const saveChatStats = async (chatCount: number): Promise<void> => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    CHAT_STATS_KEY,
    JSON.stringify({
      totalChatCount: chatCount,
      lastUpdated: new Date().toISOString(),
    })
  );
};
