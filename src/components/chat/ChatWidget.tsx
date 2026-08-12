import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { Message, PendingAction } from './types';
import {
  getStoredSessionId,
  getStoredSessionProfile,
  isApiConfigured,
  resolvePendingAction,
  sendChatMessage,
  storeSessionProfile,
} from './api';
import chatbotIcon from '../../assets/images/image.png';
import robotAvatar from './robotAvatar.png';
import '../../assets/styles/ChatWidget.scss';

// Icons as simple SVGs to avoid MUI dependency
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const MinimizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
);

interface UserInfo {
  name: string;
  email: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => getStoredSessionProfile());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isResolvingAction, setIsResolvingAction] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Show widget after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowWidget(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, pendingAction]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(target)) {
        setIsOpen(false);
      }
      if (showForm && formRef.current && !formRef.current.contains(target)) {
        setShowForm(false);
      }
    };

    if (isOpen || showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, showForm]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showForm) setShowForm(false);
        if (isOpen) setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showForm, isOpen]);

  const handleToggle = () => {
    if (!userInfo && !getStoredSessionId()) {
      setShowForm(true);
    } else {
      setIsOpen(prev => !prev);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    if (name?.trim() && email?.trim()) {
      const nextUserInfo = { name: name.trim(), email: email.trim() };
      setUserInfo(nextUserInfo);
      storeSessionProfile(nextUserInfo);
      setShowForm(false);
      setIsOpen(true);
      
      // Personalized welcome
      setMessages([{
        id: 'welcome-personal',
        content: `Hey **${nextUserInfo.name}**! 👋 Thanks for stopping by. I'm Botfolio, here to help you explore Bagtyyar's portfolio. What would you like to know?`,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    setIsTyping(true);

    try {
      // Check if API is configured
      if (!isApiConfigured()) {
        throw new Error('Chat is currently unavailable. Please try the contact form instead!');
      }

      const response = await sendChatMessage(text, userInfo ?? undefined);
      setPendingAction(response.pendingAction);

      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        content: response.reply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      // User-friendly error messages
      let errorMsg = 'Oops! Something went wrong. Please try again or use the contact form.';
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMsg = 'Network issue detected. Please check your connection and try again.';
        } else if (error.message.includes('unavailable') || error.message.includes('contact form')) {
          errorMsg = error.message;
        }
      }
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: errorMsg,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, userInfo]);

  const handlePendingAction = useCallback(async (action: 'confirm' | 'cancel') => {
    if (!pendingAction) return;

    const userMessage: Message = {
      id: `action-${action}-${Date.now()}`,
      content: action === 'confirm' ? 'Confirm' : 'Cancel',
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsResolvingAction(true);
    setIsTyping(true);

    try {
      const response = await resolvePendingAction(pendingAction.actionId, action);
      setPendingAction(response.pendingAction);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          content: response.reply,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: error instanceof Error
          ? error.message
          : 'Hmm… looks like I could not complete that action. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsResolvingAction(false);
      setIsTyping(false);
    }
  }, [pendingAction]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    // Set new height based on content (max 120px)
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (!showWidget) return null;

  return (
    <div className="chat-widget">
      {/* Floating Action Button */}
      {!isOpen && !showForm && (
        <button
          className="chat-widget__fab"
          onClick={handleToggle}
          aria-label="Open chat"
        >
          <img src={chatbotIcon} alt="" aria-hidden="true" />
          <span className="chat-widget__fab-pulse"></span>
        </button>
      )}

      {/* User Info Form */}
      {showForm && !userInfo && !getStoredSessionId() && (
        <form 
          className="chat-widget__form" 
          onSubmit={handleFormSubmit}
          ref={formRef}
        >
          <h3 className="chat-widget__form-title">Let's chat! 👋</h3>
          <div className="chat-widget__form-field">
            <label htmlFor="chat-name">Name</label>
            <input
              id="chat-name"
              name="name"
              type="text"
              placeholder="Your name"
              required
              autoFocus
            />
          </div>
          <div className="chat-widget__form-field">
            <label htmlFor="chat-email">Email</label>
            <input
              id="chat-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="chat-widget__form-actions">
            <button type="submit" className="chat-widget__form-submit">
              Start Chat
            </button>
            <button 
              type="button" 
              className="chat-widget__form-cancel"
              onClick={() => setShowForm(false)}
              aria-label="Cancel"
            >
              <CloseIcon />
            </button>
          </div>
        </form>
      )}

      {/* Chat Window */}
      {isOpen && (userInfo || getStoredSessionId()) && (
        <div 
          className="chat-widget__window" 
          ref={chatWindowRef}
          role="dialog"
          aria-label="Chat with Botfolio"
        >
          {/* Header */}
          <header className="chat-widget__header">
            <div className="chat-widget__header-info">
              <span className="chat-widget__header-avatar">
              <img src={robotAvatar} alt="Bot" />
            </span>
              <div>
                <h2 className="chat-widget__header-title">Botfolio</h2>
                <span className="chat-widget__header-status">
                  <span className="chat-widget__status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="chat-widget__header-actions">
              <button 
                onClick={() => setIsOpen(false)} 
                aria-label="Minimize chat"
                className="chat-widget__header-btn"
              >
                <MinimizeIcon />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="chat-widget__messages" role="log" aria-live="polite">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="chat-message chat-message--bot">
                <div className="chat-message__avatar">
                  <img src={robotAvatar} alt="Bot" />
                </div>
                <TypingIndicator />
              </div>
            )}
            {pendingAction && !isTyping && (
              <div className="chat-widget__pending-action" role="group" aria-label="Pending action confirmation">
                <div className="chat-widget__pending-action-title">{pendingAction.label}</div>
                <div className="chat-widget__pending-action-summary">{pendingAction.summary}</div>
                <div className="chat-widget__pending-action-buttons">
                  <button
                    type="button"
                    className="chat-widget__pending-action-confirm"
                    onClick={() => handlePendingAction('confirm')}
                    disabled={isResolvingAction}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="chat-widget__pending-action-cancel"
                    onClick={() => handlePendingAction('cancel')}
                    disabled={isResolvingAction}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <footer className="chat-widget__input-area">
            <textarea
              ref={inputRef}
              className="chat-widget__input"
              placeholder="Type a message..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label="Message input"
              rows={1}
            />
            <button
              className="chat-widget__send-btn"
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
