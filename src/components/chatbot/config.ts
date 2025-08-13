import { createChatBotMessage } from "react-chatbot-kit";
import ActionProvider from "./ActionProvider";
import MessageParser from "./MessageParser";

const config = {
  botName: "AI Assistant",
  initialMessages: [
    createChatBotMessage("Hi, I am Bagtyyar's Chatbot! Ask me anything about my portfolio or tools I have worked with.", { widget: "welcome" })
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#1976d2",
    },
    chatButton: {
      backgroundColor: "#1976d2",
    },
  },
};

export default config;
