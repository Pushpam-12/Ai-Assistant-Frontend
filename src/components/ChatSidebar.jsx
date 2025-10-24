import React, { useState, useEffect } from "react";
import { FiMessageSquare, FiPlus, FiTrash2, FiMenu, FiX } from "react-icons/fi";
import useSessions from "../hooks/useSessions";

export default function ChatSidebar({
  currentSessionId,
  onSessionSelect,
  onNewChat,
}) {
  const { sessions, loading, error, deleteSession, refreshSessions } =
    useSessions();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Refresh sessions when currentSessionId changes (new chat created)
  useEffect(() => {
    if (currentSessionId) {
      refreshSessions();
    }
  }, [currentSessionId, refreshSessions]);

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    const result = await deleteSession(sessionId);
    if (!result.success) {
      alert("Failed to delete chat. Please try again.");
    } else if (currentSessionId === sessionId) {
      onNewChat();
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getTitle = (session) => {
    // Use the title if it exists, otherwise generate from first message
    if (session.title && session.title.trim()) {
      return session.title;
    }

    if (!session.messages || session.messages.length === 0) {
      return "New conversation";
    }

    const firstUserMsg = session.messages.find((m) => m.role === "user");
    if (!firstUserMsg) return "New conversation";

    // Truncate to a reasonable length for title
    const text = firstUserMsg.text.trim();
    return text.length > 40 ? text.substring(0, 40) + "..." : text;
  };

  return (
    <>
      {isMobile && (
        <button onClick={() => setIsOpen(!isOpen)} className="sidebar-toggle">
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div className={`chat-sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <button
            onClick={() => {
              // Reset current session
              onSessionSelect(null);
              // Trigger new chat creation
              onNewChat();
              if (isMobile) setIsOpen(false);
            }}
            className="new-chat-btn"
          >
            <FiPlus size={20} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="sessions-list">
          {loading ? (
            <div className="loading-sessions">
              <p>Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="error-sessions">
              <p>Error loading conversations</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-sessions">
              <FiMessageSquare size={32} />
              <p>No chat history yet</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  onSessionSelect(session.id);
                  if (isMobile) setIsOpen(false);
                }}
                className={`session-item ${
                  currentSessionId === session.id ? "active" : ""
                }`}
              >
                <div className="session-content">
                  <div className="session-header">
                    <FiMessageSquare size={14} />
                    <span className="session-date">
                      {formatDate(session.createdAt)}
                    </span>
                  </div>
                  <p className="session-title">{getTitle(session)}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="delete-btn"
                  title="Delete chat"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="session-count">
            {sessions.length}{" "}
            {sessions.length === 1 ? "conversation" : "conversations"}
          </div>
        </div>
      </div>
    </>
  );
}
