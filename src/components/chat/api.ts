import axios, { AxiosInstance } from 'axios';
import { Message } from './types';

interface UserInfo {
  name: string;
  email: string;
}

export interface PendingAction {
  actionId: string;
  label: string;
  summary: string;
}

export interface ChatResponse {
  reply: string;
  pendingAction: PendingAction | null;
}

const API_URL = process.env.REACT_APP_API_URL;
const SESSION_ID_KEY = 'botfolio-session-id';
const SESSION_PROFILE_KEY = 'botfolio-session-profile';
const SESSION_MESSAGES_KEY = 'botfolio-session-messages';
const SESSION_PENDING_ACTION_KEY = 'botfolio-session-pending-action';
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const WAKE_COOLDOWN_MS = 5 * 60 * 1000;

let lastWakeAt = 0;

interface StoredValue<T> {
  value: T;
  expiry: number;
}

const setWithTTL = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify({
    value,
    expiry: Date.now() + SESSION_TTL_MS,
  }));
};

const getWithTTL = <T>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredValue<T>;
    if (!parsed || typeof parsed.expiry !== 'number' || Date.now() > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const getStoredSessionId = (): string | null => getWithTTL<string>(SESSION_ID_KEY);

export const getStoredSessionProfile = (): UserInfo | null => {
  const profile = getWithTTL<UserInfo>(SESSION_PROFILE_KEY);
  if (!profile?.name || !profile?.email) {
    localStorage.removeItem(SESSION_PROFILE_KEY);
    return null;
  }
  return profile;
};

export const storeSessionProfile = (userInfo: UserInfo): void => {
  setWithTTL(SESSION_PROFILE_KEY, userInfo);
};

function isMessage(value: unknown): value is Message {
  const message = value as Message;
  return (
    typeof message?.id === 'string' &&
    typeof message.content === 'string' &&
    (message.sender === 'user' || message.sender === 'bot')
  );
}

export const getStoredMessages = (): Message[] => {
  const messages = getWithTTL<Array<Omit<Message, 'timestamp'> & { timestamp: string }>>(SESSION_MESSAGES_KEY);
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(isMessage)
    .map(message => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
};

export const storeMessages = (messages: Message[]): void => {
  setWithTTL(SESSION_MESSAGES_KEY, messages.slice(-40));
};

export const getStoredPendingAction = (): PendingAction | null => {
  const pendingAction = getWithTTL<PendingAction>(SESSION_PENDING_ACTION_KEY);
  if (!pendingAction?.actionId || !pendingAction.label || !pendingAction.summary) {
    localStorage.removeItem(SESSION_PENDING_ACTION_KEY);
    return null;
  }
  return pendingAction;
};

export const storePendingAction = (pendingAction: PendingAction | null): void => {
  if (!pendingAction) {
    localStorage.removeItem(SESSION_PENDING_ACTION_KEY);
    return;
  }
  setWithTTL(SESSION_PENDING_ACTION_KEY, pendingAction);
};

const storeSessionId = (sessionId: string): void => {
  setWithTTL(SESSION_ID_KEY, sessionId);
};

const refreshSessionProfile = (userInfo?: UserInfo): void => {
  if (userInfo) storeSessionProfile(userInfo);
};

const getAxiosInstance = (): AxiosInstance | null => {
  if (!API_URL) return null;
  return axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });
};

const getBackendUrl = (pathname: string): string => {
  if (!API_URL) throw new Error('Chat API is not configured. Please set REACT_APP_API_URL.');

  const url = new URL(API_URL, window.location.origin);
  url.pathname = url.pathname.replace(/\/chat\/?$/, '');
  url.pathname = `${url.pathname.replace(/\/$/, '')}${pathname}`;
  return url.toString();
};

const getActionUrl = (actionId: string, action: 'confirm' | 'cancel'): string => (
  getBackendUrl(`/actions/${actionId}/${action}`)
);

export const wakeChatApi = async (): Promise<void> => {
  if (!API_URL) return;

  const now = Date.now();
  if (now - lastWakeAt < WAKE_COOLDOWN_MS) return;
  lastWakeAt = now;

  try {
    await axios.get(getBackendUrl('/health'), { timeout: 10000 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.info('Chat API wake-up failed:', msg);
  }
};

export const sendChatMessage = async (
  message: string,
  userInfo?: UserInfo
): Promise<ChatResponse> => {
  const axiosInstance = getAxiosInstance();
  
  if (!axiosInstance) {
    throw new Error('Chat API is not configured. Please set REACT_APP_API_URL.');
  }

  try {
    const sessionId = getStoredSessionId();
    const payload = {
      message,
      sessionId: sessionId || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(!sessionId && userInfo && { user: userInfo }),
    };
    const response = await axiosInstance.post('', payload);
    if (typeof response.data.sessionId === 'string') {
      storeSessionId(response.data.sessionId);
      refreshSessionProfile(userInfo);
    }
    return {
      reply: response.data.reply,
      pendingAction: response.data.pendingAction || null,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('API request failed:', msg);
    throw new Error('Hmm… looks like I\'m having some issues. Please try again.');
  }
};

export const resolvePendingAction = async (
  actionId: string,
  action: 'confirm' | 'cancel'
): Promise<ChatResponse> => {
  const sessionId = getStoredSessionId();
  if (!sessionId) {
    throw new Error('Session expired. Please start a new chat.');
  }

  try {
    const response = await axios.post(
      getActionUrl(actionId, action),
      { sessionId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return {
      reply: response.data.reply,
      pendingAction: response.data.pendingAction || null,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Action request failed:', msg);
    throw new Error('Hmm… looks like I could not complete that action. Please try again.');
  }
};

export const isApiConfigured = (): boolean => {
  return !!API_URL;
};
