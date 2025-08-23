import React, { useState, useEffect, useRef } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";
import chatbotIcon from "../assets/images/chat.svg";
import notificationSound from "../assets/sounds/notification.mp3";

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load notification sound
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
  }, []);

  // Show icon after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIcon(true);
      playNotificationSound();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Close chatbot on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Audio play was prevented:", error);
      });
    }
  };

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSaveMessages = (newMessages: any[]) => {
    if (isMountedRef.current) {
      setMessages(newMessages);
    }
  };

  return (
    <div style={styles.container}>
      {showIcon && (
        <>
          <button
            style={styles.iconButton}
            aria-label="Toggle chatbot"
            onClick={toggleChatbot}
          >
            <img src={chatbotIcon} alt="Chatbot Icon" style={styles.iconImage} />
          </button>

          <div
            style={{
              ...styles.chatbotContainer,
              display: isOpen ? "block" : "none",
            }}
            ref={chatbotRef}
          >
            <Chatbot
              config={{
                ...config,
                initialMessages: messages.length ? messages : config.initialMessages,
              }}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
              validator={(str) => str.trim().length !== 0}
              saveMessages={handleSaveMessages}
            />
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed" as const,
    bottom: 24,
    right: 24,
    zIndex: 9999,
  },
  chatbotContainer: {
    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
    borderRadius: 8,
    background: "#fff",
    overflow: "hidden" as const,
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
