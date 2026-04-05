import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const THRESHOLD_KEY = 'ews_alert_threshold';
const PREV_SCORES_KEY = 'ews_prev_scores';

export function useAlerts() {
  const [threshold, setThreshold] = useState(() => {
    return parseInt(localStorage.getItem(THRESHOLD_KEY) || '70', 10);
  });

  const saveThreshold = (val) => {
    setThreshold(val);
    localStorage.setItem(THRESHOLD_KEY, val.toString());
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const checkAlerts = useCallback((countries) => {
    let prev = {};
    try { prev = JSON.parse(localStorage.getItem(PREV_SCORES_KEY) || '{}'); } catch {}

    countries.forEach(c => {
      const prevScore = prev[c.iso_code] || 0;
      const currScore = c.latest_stress_score || 0;

      // Alert when crossing threshold
      if (prevScore < threshold && currScore >= threshold) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-rose-900/90 border border-rose-500/50 shadow-lg rounded-2xl p-4 text-white backdrop-blur-md`}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-bold text-rose-300">Crisis Alert: {c.name}</p>
                <p className="text-sm text-rose-200 mt-1">
                  Stress score crossed {threshold} — now at <strong>{currScore.toFixed(1)}</strong> ({c.risk_level})
                </p>
              </div>
            </div>
          </div>
        ), { duration: 8000 });

        // Browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(`⚠️ ${c.name} Risk Alert`, {
            body: `Stress score: ${currScore.toFixed(1)} — ${c.risk_level}`,
          });
        }
      }
    });

    // Save current state
    const newScores = {};
    countries.forEach(c => { newScores[c.iso_code] = c.latest_stress_score || 0; });
    localStorage.setItem(PREV_SCORES_KEY, JSON.stringify(newScores));
  }, [threshold]);

  const requestPermission = () => Notification.requestPermission();

  return { threshold, saveThreshold, checkAlerts, requestPermission };
}
