import { createChatBotMessage } from "react-chatbot-kit";
import CustomAvatar from "./CustomAvatar";
import MarkdownMessage from "./CustomMarkDown";

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
    botAvatar: CustomAvatar,
    // if needed comment line below to use default configuration
    botChatMessage: MarkdownMessage,
  },
};

export default config;
