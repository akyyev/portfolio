import { createChatBotMessage } from "react-chatbot-kit";
import CustomAvatar from './CustomAvatar';

const config = {
  botName: "AI Assistant",
  initialMessages: [
    createChatBotMessage("Hello! I'm Botfolio. Interested in exploring his portfolio? Ask me anything!", {
      widget: "welcome"
    })
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
  botAvatar: CustomAvatar
}

};

export default config;
