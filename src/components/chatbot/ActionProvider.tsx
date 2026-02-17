import React, { ReactNode } from "react";
import axios, { AxiosInstance } from "axios";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotMessage {
  type: "user" | "assistant";
  message: string;
}

interface ChatState {
  messages: ChatBotMessage[];
}

interface ActionProviderProps {
  createChatBotMessage: (content: string) => ChatBotMessage;
  setState: (update: (prev: ChatState) => ChatState) => void;
  children: ReactNode;
}

const API_URL = process.env.REACT_APP_API_URL;

const getAxiosInstance = (): AxiosInstance | null => {
  if (!API_URL) return null;
  return axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
  });
};

const formatHistory = (messages: ChatBotMessage[]): ChatMessage[] =>
  messages.map((msg) => ({
    role: msg.type === "user" ? "user" : "assistant",
    content: msg.message,
  }));

const sendToAPI = async (
  axiosInstance: AxiosInstance,
  messages: ChatMessage[]
): Promise<string> => {
  try {
    const payload = {
      messages,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const response = await axiosInstance.post("/", payload);
    return response.data.reply;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("API request failed:", msg);
    return "Hmm… looks like I'm having some issues.";
  }
};

const ActionProvider: React.FC<ActionProviderProps> = ({
  createChatBotMessage,
  setState,
  children,
}) => {
  const axiosInstance = getAxiosInstance();

  const getPreviousMessages = (): Promise<ChatBotMessage[]> =>
    new Promise((resolve) => {
      setState((prev) => {
        resolve(prev.messages ?? []);
        return prev;
      });
    });

  const appendBotMessage = (content: string): void => {
    const botMessage = createChatBotMessage(content);
    setState((prev) => ({
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleMessage = async (userMessage: string): Promise<void> => {
    if (!axiosInstance) {
      appendBotMessage("Chat API is not configured.");
      return;
    }

    try {
      const prevMessages = await getPreviousMessages();
      const formattedMessages = formatHistory(prevMessages);
      formattedMessages.push({ role: "user", content: userMessage });
      const botReply = await sendToAPI(axiosInstance, formattedMessages);
      appendBotMessage(botReply);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error in handleMessage:", msg);
      appendBotMessage("Error: Unable to process your request at this time.");
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ actions?: Record<string, unknown> }>, {
              actions: { handleMessage },
            })
          : child
      )}
    </div>
  );
};

export default ActionProvider;
