import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Message } from './types';
import robotAvatar from './robotAvatar.png';

marked.setOptions({ breaks: true });

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  const sanitizedHtml = DOMPurify.sanitize(marked(message.content) as string);

  return (
    <div 
      className={`chat-message ${isBot ? 'chat-message--bot' : 'chat-message--user'}`}
      role="article"
      aria-label={`${isBot ? 'Bot' : 'You'}: ${message.content}`}
    >
      {isBot && (
        <div className="chat-message__avatar">
          <img src={robotAvatar} alt="Bot" />
        </div>
      )}
      <div 
        className="chat-message__bubble"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
};

export default ChatMessage;
