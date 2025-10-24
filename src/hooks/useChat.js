import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // 👈 for formatted AI responses

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🧩 In-memory cache to prevent redundant reloads
const chatCache = new Map();

export function useChat(initialSessionId, onSessionIdChange) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef();
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 🧠 Load history (but only once per session)
  useEffect(() => {
    if (!initialSessionId) return;

    const cached = chatCache.get(initialSessionId);
    if (cached) {
      setMessages(cached);
      setTimeout(scrollToBottom, 100);
      return;
    }

    axios
      .get(`${API_BASE_URL}/history/${initialSessionId}`)
      .then((r) => {
        const msgs = r.data.messages || [];
        chatCache.set(initialSessionId, msgs);
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      })
      .catch((err) => {
        console.error("Fetch history error:", err.message);
      });
  }, [initialSessionId, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  // 💬 Send message
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    setIsTyping(true);
    const payload = { sessionId: initialSessionId, prompt: text };

    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setText("");

    try {
      const res = await axios.post(`${API_BASE_URL}/send`, payload);

      // update session ID if new
      if (res.data.sessionId && res.data.sessionId !== initialSessionId) {
        onSessionIdChange(res.data.sessionId);
      }

      // 🧩 AI response (supports markdown)
      const aiMessage = { role: "ai", text: res.data.message };
      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        chatCache.set(initialSessionId || res.data.sessionId, updated);
        return updated;
      });
    } catch (err) {
      const errorMessage = { role: "ai", text: "⚠️ Error: could not reach server." };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Send message error:", err.message);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  return {
    messages,
    text,
    isTyping,
    inputRef,
    messagesEndRef,
    setText,
    sendMessage,
  };
}
