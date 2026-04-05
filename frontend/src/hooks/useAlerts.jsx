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
      try {
        Notification.requestPermission();
      } catch (e) {
        console.warn("[Institutional Audit] Notification permission request failed on this platform.");
      }
    }
  }, []);

  const checkAlerts = useCallback((countries) => {
    let prev = {};
    try { 
      prev = JSON.parse(localStorage.getItem(PREV_SCORES_KEY) || '{}'); 
    } catch {
      prev = {};
    }

    const highRisk = countries.filter(c => {
      const prevScore = prev[c.iso_code] || 0;
      const currScore = c.latest_stress_score || 0;
      return prevScore < threshold && currScore >= threshold;
    });

    if (highRisk.length > 0) {
      highRisk.forEach(c => {
        // UI Toast Alert (100% Mobile Safe)
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-rose-900/90 border border-rose-500/50 shadow-lg rounded-2xl p-4 text-white backdrop-blur-md`}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-bold text-rose-300">Crisis Alert: {c.name}</p>
                <p className="text-sm text-rose-200 mt-1">
                  Threshold crossed — now at <strong>{c.latest_stress_score.toFixed(1)}</strong> ({c.risk_level})
                </p>
              </div>
            </div>
          </div>
        ), { duration: 8000 });

        // Institutional Notification - Defensive Logic for Mobile Platforms
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            // Older Android/iOS Chrome crashes on "new Notification()" constructor
            // We only attempt if we aren't in a restricted ServiceWorker context
            if (!("ServiceWorkerRegistration" in window)) {
              new Notification(`⚠️ ${c.name} Risk Alert`, {
                body: `${c.name} Stress Score hit ${c.latest_stress_score.toFixed(1)}. Visualizing risk contagion...`,
                icon: '/logo192.png'
              });
            } else {
              console.log("[Institutional Audit] Platform requires ServiceWorker for notifications. Constructor suppressed.");
            }
          } catch (e) {
            console.warn("[Institutional Audit] Notification constructor blocked by platform. Suppression active.");
          }
        }
      });
    }

    // Save current scores to local storage for the next delta check
    const newScores = {};
    countries.forEach(c => { 
      newScores[c.iso_code] = c.latest_stress_score || 0; 
    });
    localStorage.setItem(PREV_SCORES_KEY, JSON.stringify(newScores));
  }, [threshold]);

  const requestPermission = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission();
    }
  };

  return { threshold, saveThreshold, checkAlerts, requestPermission };
}
