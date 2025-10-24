import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useSessions = (autoFetch = true) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
      
      setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const refreshSessions = useCallback(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (autoFetch) {
      fetchSessions();
    }
  }, [autoFetch, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    deleteSession,
    refreshSessions,
    setSessions
  };
};

export default useSessions;