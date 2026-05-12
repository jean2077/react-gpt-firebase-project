import type { LocalAuthSession, LocalAuthUser, StoredLocalAuthUser } from '../types/domain';

const USERS_STORAGE_KEY = 'langpt.localAuth.users';
const SESSION_STORAGE_KEY = 'langpt.localAuth.session';
export const LOCAL_AUTH_EVENT = 'langpt-local-auth-change';

const DEMO_USER: Omit<StoredLocalAuthUser, 'createdAt' | 'lastLoginAt' | 'passwordHash'> = {
  id: 'local-demo-user',
  email: 'demo@langpt.local',
  nickname: '데모 사용자',
  provider: 'demo',
};

const TEMPORARY_PASSWORD = 'Langpt123!';

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readJson = <T,>(key: string, fallbackValue: T): T => {
  if (!canUseStorage()) {
    return fallbackValue;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeJson = <T,>(key: string, value: T): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LOCAL_AUTH_EVENT));
  }
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const createLocalId = (): string => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const encodePassword = (password: string): string => {
  if (typeof window === 'undefined' || typeof window.btoa !== 'function') {
    return password;
  }

  return window.btoa(encodeURIComponent(password));
};

const withoutSecret = (user: StoredLocalAuthUser | null | undefined): LocalAuthUser | null => {
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const readUsers = (): StoredLocalAuthUser[] => readJson<StoredLocalAuthUser[]>(USERS_STORAGE_KEY, []);

const saveUsers = (users: StoredLocalAuthUser[]): void => {
  writeJson(USERS_STORAGE_KEY, users);
};

const saveSession = (user: StoredLocalAuthUser): LocalAuthUser => {
  const sessionUser = withoutSecret(user);
  if (!sessionUser) {
    throw new Error('세션을 저장할 사용자 정보가 없습니다.');
  }

  writeJson(SESSION_STORAGE_KEY, {
    user: sessionUser,
    authenticatedAt: new Date().toISOString(),
  });
  notifyAuthChange();
  return sessionUser;
};

export const signInAsDemoUser = async (): Promise<LocalAuthUser> => {
  const now = new Date().toISOString();
  const users = readUsers();
  const existingIndex = users.findIndex((user) => user.id === DEMO_USER.id);
  const demoUser = {
    ...DEMO_USER,
    email: normalizeEmail(DEMO_USER.email),
    passwordHash: encodePassword(TEMPORARY_PASSWORD),
    createdAt: now,
    lastLoginAt: now,
  };

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...users[existingIndex],
      ...DEMO_USER,
      email: normalizeEmail(DEMO_USER.email),
      lastLoginAt: now,
    };
  } else {
    users.push(demoUser);
  }

  saveUsers(users);
  return saveSession(existingIndex >= 0 ? users[existingIndex] : demoUser);
};

interface LocalCredentials {
  email: string;
  password: string;
}

export const loginWithLocalCredentials = async ({
  email,
  password,
}: LocalCredentials): Promise<LocalAuthUser> => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  const userIndex = users.findIndex((user) => user.email === normalizedEmail);

  if (userIndex < 0 || users[userIndex].passwordHash !== encodePassword(password)) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  users[userIndex] = {
    ...users[userIndex],
    lastLoginAt: new Date().toISOString(),
  };
  saveUsers(users);
  return saveSession(users[userIndex]);
};

interface LocalRegistration extends LocalCredentials {
  nickname: string;
}

export const registerLocalUser = async ({
  email,
  password,
  nickname,
}: LocalRegistration): Promise<LocalAuthUser | null> => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedNickname = nickname.trim();
  const users = readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('이미 사용 중인 이메일입니다.');
  }

  if (users.some((user) => user.nickname === normalizedNickname)) {
    throw new Error('이미 사용 중인 닉네임입니다.');
  }

  const now = new Date().toISOString();
  const user: StoredLocalAuthUser = {
    id: createLocalId(),
    email: normalizedEmail,
    nickname: normalizedNickname,
    passwordHash: encodePassword(password),
    provider: 'local',
    createdAt: now,
    lastLoginAt: null,
  };

  saveUsers([...users, user]);
  return withoutSecret(user);
};

export const isLocalEmailRegistered = async (email: string): Promise<boolean> => {
  const normalizedEmail = normalizeEmail(email);
  return readUsers().some((user) => user.email === normalizedEmail);
};

export const isLocalNicknameRegistered = async (nickname: string): Promise<boolean> => {
  const normalizedNickname = nickname.trim();
  return readUsers().some((user) => user.nickname === normalizedNickname);
};

export const findLocalAccount = async (email: string): Promise<LocalAuthUser | null> => {
  const normalizedEmail = normalizeEmail(email);
  const user = readUsers().find((item) => item.email === normalizedEmail);
  return withoutSecret(user);
};

export const resetLocalPassword = async (
  email: string
): Promise<{ user: LocalAuthUser | null; temporaryPassword: string }> => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  const userIndex = users.findIndex((user) => user.email === normalizedEmail);

  if (userIndex < 0) {
    throw new Error('해당 이메일로 가입된 계정이 없습니다.');
  }

  users[userIndex] = {
    ...users[userIndex],
    passwordHash: encodePassword(TEMPORARY_PASSWORD),
    passwordResetAt: new Date().toISOString(),
  };
  saveUsers(users);

  return {
    user: withoutSecret(users[userIndex]),
    temporaryPassword: TEMPORARY_PASSWORD,
  };
};

export const getCurrentUser = (): LocalAuthUser | null => {
  const session = readJson<LocalAuthSession | null>(SESSION_STORAGE_KEY, null);
  return session?.user ?? null;
};

export const logoutLocalUser = () => {
  if (canUseStorage()) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  notifyAuthChange();
};

export const subscribeToLocalAuth = (callback: (user: LocalAuthUser | null) => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleAuthChange = () => callback(getCurrentUser());
  window.addEventListener(LOCAL_AUTH_EVENT, handleAuthChange);
  window.addEventListener('storage', handleAuthChange);
  callback(getCurrentUser());

  return () => {
    window.removeEventListener(LOCAL_AUTH_EVENT, handleAuthChange);
    window.removeEventListener('storage', handleAuthChange);
  };
};
