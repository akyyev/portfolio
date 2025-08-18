import React, { useState, useEffect } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";
import chatbotIcon from "../assets/images/chat2.png"; 
import notificationSound from "../assets/sounds/notification.mp3";

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIcon(true);
      playNotificationSound();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch(error => {
      console.log("Audio play was prevented:", error);
    });
  };

  const toggleChatbot = () => {
    setIsOpen(prevState => !prevState);
  };

  return (
    <div style={styles.container}>
      {showIcon && (
        isOpen ? (
          <div style={styles.chatbotContainer}>
            <button
              style={styles.closeButton}
              aria-label="Close chatbot"
              onClick={toggleChatbot}
            >
              x
            </button>
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
              validator={(str) => str.trim().length !== 0}
            />
          </div>
        ) : (
          <button
            style={styles.iconButton}
            aria-label="Open chatbot"
            onClick={toggleChatbot}
          >
            <img
              src={chatbotIcon}
              alt="Chatbot Icon"
              style={styles.iconImage}
            />
          </button>
        )
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed" as "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9999,
  },
  chatbotContainer: {
    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
    borderRadius: 8,
    background: "#fff",
    overflow: "hidden" as "hidden",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: 15,
    cursor: "pointer",
    padding: 9,
    display: "flex",
    justifyContent: "flex-end",
    width: "95%"
  },
  iconButton: {
    width: 70,
    height: 70,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 10,
  },
  iconImage: {
    width: "150%",
    height: "150%",
  },
};

export default ChatbotWidget;
