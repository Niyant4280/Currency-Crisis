import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import CountryCard from '../components/CountryCard';
import LiveIndicator from '../components/LiveIndicator';
import WakingPanel from '../components/WakingPanel';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useWatchlist } from '../hooks/useWatchlist';
import { useAlerts } from '../hooks/useAlerts.jsx';
import { REGION_MAP } from '../constants/countries';
import { motion, AnimatePresence } from 'framer-motion';

const RETRY_WAIT_SECS = 15; // seconds between auto-retries
const MAX_ATTEMPTS = 8;     // give up after this many failed attempts

const Home = () => {
  const navigate = useNavigate();
  const { status, countdown, lastRefresh } = useLiveStatus(30000);
  const { watchlist, toggle, isWatched } = useWatchlist();
  const { threshold, saveThreshold, checkAlerts, requestPermission } = useAlerts();

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waking, setWaking] = useState(false);       // true while retrying cold-start
  const [retryIn, setRetryIn] = useState(0);          // countdown seconds
  const [filterRegion, setFilterRegion] = useState('All');
  const [sortOption, setSortOption] = useState('stress_desc');
  const [alertThreshold, setAlertThreshold] = useState(threshold);

  const retryTimerRef   = useRef(null);
  const countdownRef    = useRef(null);
  const attemptRef      = useRef(0);

  const REGIONS = ['All', 'Asia', 'Europe', 'LatAm', 'Africa', 'MENA'];
  const regionMap = REGION_MAP;

  // ── Cleanup helpers ──────────────────────────────────────────
  const clearRetryTimers = () => {
    clearTimeout(retryTimerRef.current);
    clearInterval(countdownRef.current);
  };

  // ── Start countdown + schedule next fetchData ─────────────────
  const scheduleRetry = () => {
    let remaining = RETRY_WAIT_SECS;
    setRetryIn(remaining);

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setRetryIn(remaining);
      if (remaining <= 0) clearInterval(countdownRef.current);
    }, 1000);

    retryTimerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current);
      fetchData();
    }, RETRY_WAIT_SECS * 1000);
  };

  // ── Main data fetch with retry logic ─────────────────────────
  const fetchData = async () => {
    clearRetryTimers();
    try {
      const res = await getLeaderboard();
      if (!res?.data?.data) throw new Error('MALFORMED DATA SIGNAL');

      const mapped = res.data.data.map(c => ({
        iso_code: c.country_code || 'UNK',
        name: c.country_name || 'Unknown Entity',
        currency: c.currency_code || '---',
        latest_stress_score: c.score || 0,
        risk_level: c.risk_level || 'UNKNOWN',
      }));

      // ── Success ──
      attemptRef.current = 0;
      setCountries(mapped);
      if (mapped) checkAlerts(mapped);
      setWaking(false);
      setError(null);
      setLoading(false);
    } catch (err) {
      attemptRef.current += 1;
      const statusMsg = err.response
        ? `HTTP ${err.response.status}`
        : err.request
        ? 'NETWORK TIMEOUT'
        : `APP ERROR: ${err.message}`;

      if (attemptRef.current <= MAX_ATTEMPTS) {
        // ── Keep retrying: show waking panel ──
        setWaking(true);
        setLoading(true);
        scheduleRetry();
      } else {
        // ── Gave up after MAX_ATTEMPTS ──
        setError(`Unable to reach backend (${statusMsg})`);
        setWaking(false);
        setLoading(false);
      }
    }
  };

  const retryNow = () => {
    clearRetryTimers();
    fetchData();
  };

  useEffect(() => {
    fetchData();
    // Background refresh every 30s (only when data already loaded)
    const interval = setInterval(() => {
      if (!waking && !loading) fetchData();
    }, 30000);
    return () => {
      clearInterval(interval);
      clearRetryTimers();
    };
  }, []);

  // ── Filter + Sort ─────────────────────────────────────────────
  const getFilteredCountries = () => {
    let filtered = [...countries];
    if (filterRegion !== 'All') filtered = filtered.filter(c => regionMap[c.iso_code] === filterRegion);
    filtered.sort((a, b) => {
      const sa = a.latest_stress_score || 0, sb = b.latest_stress_score || 0;
      if (sortOption === 'stress_desc') return sb - sa;
      if (sortOption === 'stress_asc')  return sa - sb;
      if (sortOption === 'name')        return a.name.localeCompare(b.name);
      return 0;
    });
    return filtered;
  };

  const watchedCountries  = countries.filter(c => isWatched(c.iso_code));
  const displayedCountries = getFilteredCountries();

  // ── Render: waking / loading / error / data ──────────────────
  if (waking) return (
    <WakingPanel
      retryIn={retryIn}
      retryWaitSecs={RETRY_WAIT_SECS}
      attemptNum={attemptRef.current}
      maxAttempts={MAX_ATTEMPTS}
      onRetryNow={retryNow}
    />
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
    </div>
  );

  if (error) return (
    <div className="bg-red-500/20 border border-red-500 text-red-500 p-6 rounded-xl m-6 backdrop-blur-md shadow-[0_0_50px_rgba(239,68,68,0.2)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-lg mb-1 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Connectivity Interrupt
          </p>
          <p className="opacity-80">{error}</p>
        </div>
        <button
          onClick={() => { attemptRef.current = 0; setError(null); setLoading(true); fetchData(); }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition shadow-lg"
        >
          Reconnect
        </button>
      </div>
      <details className="mt-4 border-t border-red-500/30 pt-4">
        <summary className="text-xs uppercase tracking-widest font-bold cursor-pointer hover:opacity-100 opacity-60 transition">
          View Technical Suite Audit
        </summary>
        <div className="mt-3 p-3 bg-black/40 rounded-lg font-mono text-[10px] overflow-x-auto whitespace-pre border border-white/5">
          {JSON.stringify({ timestamp: new Date().toISOString(), endpoint: '/api/leaderboard', platform: navigator.platform, userAgent: navigator.userAgent, errorHash: error }, null, 2)}
        </div>
      </details>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back + Actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button onClick={() => navigate('/')}
          className="group flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-300 font-bold transition-all border border-slate-700/50 sm:w-auto w-full">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Return Home</span>
        </button>
        <div className="grid grid-cols-2 sm:flex items-center gap-3">
          {/* Alert threshold */}
          <div className="flex items-center justify-center space-x-2 px-3 py-2.5 glass-panel rounded-xl border border-slate-700/50 text-sm">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Alert ≥</span>
            <input
              type="number" min="0" max="100"
              value={alertThreshold}
              onChange={e => setAlertThreshold(Number(e.target.value))}
              onBlur={() => { saveThreshold(alertThreshold); requestPermission(); }}
              className="w-10 bg-transparent text-white font-black text-center focus:outline-none"
            />
          </div>
          <button onClick={() => navigate('/compare')}
            className="px-4 py-2.5 glass-panel rounded-xl border border-slate-700/50 text-slate-300 text-[11px] font-black uppercase tracking-widest hover:border-indigo-500/40 transition">
            ⚖️ Compare
          </button>
          <button onClick={() => navigate('/map')}
            className="hidden sm:block px-4 py-2.5 glass-panel rounded-xl border border-slate-700/50 text-slate-300 text-[11px] font-black uppercase tracking-widest hover:border-indigo-500/40 transition">
            🗺 World Map
          </button>
        </div>
      </div>

      {/* Live Status Bar */}
      <LiveIndicator status={status} countdown={countdown} lastRefresh={lastRefresh} />

      {/* Watchlist */}
      <AnimatePresence>
        {watchedCountries.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="glass-panel px-4 pt-4 pb-2 rounded-2xl border border-amber-500/20">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
                <span>⭐</span><span>Watchlist ({watchedCountries.length}/5)</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {watchedCountries.map((c, i) => (
                  <CountryCard key={c.iso_code} country={c} rank={i + 1} animationDelay={i}
                    isWatched={true} onWatchToggle={() => toggle(c.iso_code)} compact />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter / Sort bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-slate-900/40 p-4 rounded-2xl glass-panel relative z-10 gap-6">
        <div className="flex space-x-2 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 scrollbar-hide mask-fade-right">
          {REGIONS.map(region => (
            <button key={region} onClick={() => setFilterRegion(region)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                filterRegion === region
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
              }`}>
              {region}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between w-full lg:w-auto space-x-4 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sort Analytics</span>
          <select value={sortOption} onChange={e => setSortOption(e.target.value)}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none min-w-[140px]">
            <option value="stress_desc">Stress: High → Low</option>
            <option value="stress_asc">Stress: Low → High</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayedCountries.map((c, index) => (
          <CountryCard key={c.iso_code} country={c} rank={index + 1} animationDelay={index}
            isWatched={isWatched(c.iso_code)} onWatchToggle={() => toggle(c.iso_code)} />
        ))}
      </div>
    </motion.div>
  );
};

export default Home;
