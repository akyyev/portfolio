import axios, { AxiosInstance } from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UserInfo {
  name: string,
  email: string
}

const API_URL = process.env.REACT_APP_API_URL;

const getAxiosInstance = (): AxiosInstance | null => {
  if (!API_URL) return null;
  return axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const sendChatMessage = async (
  messages: ChatMessage[],
  userInfo?: UserInfo
): Promise<string> => {
  const axiosInstance = getAxiosInstance();
  
  if (!axiosInstance) {
    throw new Error('Chat API is not configured. Please set REACT_APP_API_URL.');
  }

  try {
    const payload = {
      messages,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(userInfo && {user: userInfo}),
    };
    const response = await axiosInstance.post('/', payload);
    return response.data.reply;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('API request failed:', msg);
    throw new Error('Hmm… looks like I\'m having some issues. Please try again.');
  }
};

export const isApiConfigured = (): boolean => {
  return !!API_URL;
};
