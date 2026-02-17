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
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

import { createChatBotMessage } from "react-chatbot-kit";

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  // Close chatbot or form on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(target)) {
        setIsOpen(false);
      }
      if (showForm && formRef.current && !formRef.current.contains(target)) {
        setShowForm(false);
      }
    };

    if (isOpen || showForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, showForm]);

  // Close form on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showForm) setShowForm(false);
        if (isOpen) setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showForm, isOpen]);

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
            <form className="chatbot-form" onSubmit={handleFormSubmit} ref={formRef}>
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
              <div className="chatbot-form-actions">
                <button type="submit" className="chatbot-form-submit" aria-label="Start chat"><ChatIcon fontSize="small" /></button>
                <button type="button" className="chatbot-form-cancel" onClick={() => setShowForm(false)} aria-label="Close"><CloseIcon fontSize="small" /></button>
              </div>
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
