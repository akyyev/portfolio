import React, { useState, useEffect, useRef } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";
import chatbotIcon from "../assets/images/image.png";
import notificationSound from "../assets/sounds/notification.mp3";
import { createChatBotMessage } from "react-chatbot-kit";

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [showForm, setShowForm] = useState(false);

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim() && form.email.trim()) {
      setUserInfo({ name: form.name, email: form.email });
      setShowForm(false);
      setIsOpen(true);
    }
  };

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
    }, 3000);

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
    if (!userInfo) {
      setShowForm(true); // Show form if userInfo not set
    } else {
      setIsOpen((prev) => !prev);
    }
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
            style={{
              ...styles.iconButton,
              display: isOpen || showForm ? "none" : "block",
            }}
            aria-label="Toggle chatbot"
            onClick={toggleChatbot}
          >
            <img src={chatbotIcon} alt="Chatbot Icon" style={styles.iconImage} />
          </button>

          {showForm && !userInfo && (
            <form style={styles.form} onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="What's your name?"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={styles.input}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={styles.input}
              />
              <button type="submit" style={styles.startButton}>Start Chat</button>
            </form>
          )}

          {userInfo && (
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
                  initialMessages: messages.length ? messages : [
                    createChatBotMessage(`Hey ${userInfo.name}! Thanks for sharing your email — ${userInfo.email}. <br>
                      I’m Botfolio, here to help with Bagtyyar’s portfolio — ask me anything!`, {})
                  ],
                }}
                messageParser={MessageParser}
                actionProvider={ActionProvider}
                validator={(str) => str.trim().length !== 0}
                saveMessages={handleSaveMessages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  form: {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    minWidth: 80,
  },
  input: {
    padding: 8,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  startButton: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 0",
    fontSize: 14,
    cursor: "pointer",
  },
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
    width: 120,
    height: 120,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 30,
  },
  iconImage: {
    width: "180%",
    height: "180%",
  },
};

export default ChatbotWidget;
