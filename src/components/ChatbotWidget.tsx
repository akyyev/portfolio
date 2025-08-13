import React from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";


import { useState } from "react";

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24,  zIndex: 9999 }}>
      {open ? (
        <div style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.2)", borderRadius: 8, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 8 }}
              aria-label="Close chatbot"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} validator={(str) => str.length !== 0} />
        </div>
      ) : (
        <button
          style={{ borderRadius: "50%", width: 70, height: 70, background: "#1976d2", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 28 }}
          aria-label="Open chatbot"
          onClick={() => setOpen(true)}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
