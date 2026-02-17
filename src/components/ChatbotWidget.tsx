import React, { useState, useEffect, useRef } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import type { IMessage } from "react-chatbot-kit/build/src/interfaces/IMessages";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";  // .tsx
import ActionProvider from "./chatbot/ActionProvider";
import "../assets/styles/ChatbotWidget.scss";
import chatbotIcon from "../assets/images/image.png";
import notificationSound from "../assets/sounds/notification.mp3";

import { createChatBotMessage } from "react-chatbot-kit";

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const chatbotRef = useRef<HTMLDivElement>(null);

  const isMountedRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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


  // Preload notification sound
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
  }, []);

  // Show icon after delay and play notification sound
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIcon(true);
      audioRef.current?.play().catch(() => {
        // Browser blocked autoplay — that's fine, sound is optional
      });
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

  const toggleChatbot = () => {
    if (!userInfo) {
      setShowForm(true); // Show form if userInfo not set
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSaveMessages = (newMessages: IMessage[]) => {
    if (isMountedRef.current) {
      setMessages(newMessages);
    }
  };

  return (
    <div className="chatbot-widget-container">
      {showIcon && (
        <>
          <button
            className="chatbot-icon-button"
            style={{
              display: isOpen || showForm ? "none" : "block",
            }}
            aria-label="Toggle chatbot"
            onClick={toggleChatbot}
          >
            <img src={chatbotIcon} alt="Chatbot Icon" />
          </button>

          {showForm && !userInfo && (
            <form className="chatbot-form" onSubmit={handleFormSubmit}>
              <label htmlFor="chatbot-name" className="sr-only">Your name</label>
              <input
                id="chatbot-name"
                type="text"
                placeholder="What's your name?"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <label htmlFor="chatbot-email" className="sr-only">Your email</label>
              <input
                id="chatbot-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <button type="submit" className="chatbot-form-submit">Start Chat</button>
            </form>
          )}

          {userInfo && (
            <div
              className="chatbot-window"
              style={{
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

export default ChatbotWidget;
