import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatSidebar from "./components/ChatSidebar";
import "./styles.css";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [newChatKey, setNewChatKey] = useState(0); // unique key to reset ChatWindow

  const handleNewChat = () => {
    setSessionId(null); // reset current session
    setNewChatKey((prev) => prev + 1); // trigger ChatWindow reset
  };

  const handleSessionSelect = (selectedSessionId) => {
    setSessionId(selectedSessionId);
  };

  return (
    <div className="app-container">
      <ChatSidebar
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        key={newChatKey} // force remount whenever newChatKey changes
        sessionId={sessionId}
        setSessionId={setSessionId}
      />
    </div>
  );
}
