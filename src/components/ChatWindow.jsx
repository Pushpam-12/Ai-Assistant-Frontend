import React from "react";
import { useChat } from "../hooks/useChat";
import { FiSend, FiUser, FiMessageSquare } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

export default function ChatWindow({ sessionId, setSessionId }) {
  const {
    messages,
    text,
    isTyping,
    inputRef,
    messagesEndRef,
    setText,
    sendMessage: send,
  } = useChat(sessionId, setSessionId);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>AI Chat Assistant</h2>
        {sessionId && <span className="session-indicator">Session Active</span>}
      </div>

      <div className="messages" id="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">
              <FiMessageSquare size={48} />
            </div>
            <h3>How can I help you today?</h3>
            <p>Ask me anything or start a conversation.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`message ${m.role === "user" ? "user" : "ai"}`}
            >
              <div className="message-avatar">
                {m.role === "user" ? <FiUser /> : <FiMessageSquare />}
              </div>
              <div className="message-content">
                <div className="meta">
                  {m.role === "user" ? "You" : "AI Assistant"}
                  <span className="time">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>{" "}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="message ai typing-indicator">
            <div className="message-avatar">
              <FiMessageSquare />
            </div>
            <div className="message-content">
              <div className="meta">AI Assistant</div>
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={send} className="input-area">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows="1"
          />
          <button type="submit" disabled={!text.trim()}>
            <FiSend className="send-icon" />
          </button>
        </div>
      </form>
    </div>
  );
}
