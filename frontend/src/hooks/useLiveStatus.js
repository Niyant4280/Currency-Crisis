import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook that polls /api/status, returns live metadata,
 * and provides a countdown until the next auto-refresh.
 */
export function useLiveStatus(pollIntervalMs = 30000) {
  const [status, setStatus] = useState(null);
  const [countdown, setCountdown] = useState(pollIntervalMs / 1000);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/status`);
      setStatus(res.data.data);
      setLastRefresh(new Date());
      setCountdown(pollIntervalMs / 1000);
    } catch (e) {
      // silently fail — don't disrupt the UI
    }
  };

  useEffect(() => {
    fetchStatus();
    const poll = setInterval(fetchStatus, pollIntervalMs);
    return () => clearInterval(poll);
  }, []);

  // Countdown ticker
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? pollIntervalMs / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return { status, countdown, lastRefresh };
}
