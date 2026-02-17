import { createChatBotMessage } from "react-chatbot-kit";
import { CustomBotAvatar, CustomUserAvatar } from "./CustomAvatar";
import MarkdownMessage from "./CustomMarkDown";

interface ChatMessageProps {
  message: string;
  loader?: React.ReactElement;
}

const config = {
  botName: "AI Assistant",
  initialMessages: [
    createChatBotMessage(
      "Hello! I'm Botfolio. Interested in exploring his portfolio? Ask me anything!",
      {}
    ),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#1976d2",
    },
    chatButton: {
      backgroundColor: "#1976d2",
    },
  },
  customComponents: {
    botAvatar: CustomBotAvatar,
    userAvatar: CustomUserAvatar,
    botChatMessage: (props: ChatMessageProps) => <MarkdownMessage {...props} type="robot" />,
    userChatMessage: (props: ChatMessageProps) => <MarkdownMessage {...props} type="user" />,
  },
};

export default config;
