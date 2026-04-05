import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import CountryCard from '../components/CountryCard';
import LiveIndicator from '../components/LiveIndicator';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useWatchlist } from '../hooks/useWatchlist';
import { useAlerts } from '../hooks/useAlerts.jsx';
import { REGION_MAP } from '../constants/countries';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { status, countdown, lastRefresh } = useLiveStatus(30000);
  const { watchlist, toggle, isWatched } = useWatchlist();
  const { threshold, saveThreshold, checkAlerts, requestPermission } = useAlerts();

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRegion, setFilterRegion] = useState('All');
  const [sortOption, setSortOption] = useState('stress_desc');
  const [alertThreshold, setAlertThreshold] = useState(threshold);

  const REGIONS = ['All', 'Asia', 'Europe', 'LatAm', 'Africa', 'MENA'];
  const regionMap = REGION_MAP;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await getLeaderboard();
      if (!res?.data?.data) throw new Error("MALFORMED DATA SIGNAL");
      
      const mapped = res.data.data.map(c => ({
        iso_code: c.country_code || "UNK",
        name: c.country_name || "Unknown Entity",
        currency: c.currency_code || "---",
        latest_stress_score: c.score || 0,
        risk_level: c.risk_level || "UNKNOWN"
      }));
      setCountries(mapped || []);
      if (mapped) checkAlerts(mapped);
      setLoading(false);
    } catch (err) {
      console.error("[Institutional Audit] Connectivity Failure:", err);
      // Detailed diagnostics for the 'Client Error' vs 'Network' vs 'Backend'
      const status = err.response ? `HTTP ${err.response.status}` : (err.request ? "NETWORK TIMEOUT" : `APP ERROR: ${err.message}`);
      setError(`Unable to reach backend (${status})`);
      setCountries([]);
      setLoading(false);
    }
  };

  const getFilteredCountries = () => {
    let filtered = [...countries];
    if (filterRegion !== 'All') filtered = filtered.filter(c => regionMap[c.iso_code] === filterRegion);
    filtered.sort((a, b) => {
      const sa = a.latest_stress_score || 0, sb = b.latest_stress_score || 0;
      if (sortOption === 'stress_desc') return sb - sa;
      if (sortOption === 'stress_asc') return sa - sb;
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
    return filtered;
  };

  const watchedCountries = countries.filter(c => isWatched(c.iso_code));
  const displayedCountries = getFilteredCountries();

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-xl m-6 backdrop-blur-sm">
      <p className="font-bold">Error:</p> {error}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back + Actions row */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')}
          className="group flex items-center space-x-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-full text-slate-300 font-medium transition-all border border-slate-700/50">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span>Home</span>
        </button>
        <div className="flex items-center space-x-3">
          {/* Alert threshold */}
          <div className="flex items-center space-x-2 px-3 py-2 glass-panel rounded-xl border border-slate-700/50 text-sm">
            <span className="text-slate-400">🔔 Alert ≥</span>
            <input
              type="number" min="0" max="100"
              value={alertThreshold}
              onChange={e => setAlertThreshold(Number(e.target.value))}
              onBlur={() => { saveThreshold(alertThreshold); requestPermission(); }}
              className="w-12 bg-transparent text-white font-bold text-center focus:outline-none"
            />
          </div>
          <button onClick={() => navigate('/compare')}
            className="px-4 py-2 glass-panel rounded-xl border border-slate-700/50 text-slate-300 text-sm hover:border-indigo-500/40 transition">
            ⚖️ Compare
          </button>
          <button onClick={() => navigate('/map')}
            className="px-4 py-2 glass-panel rounded-xl border border-slate-700/50 text-slate-300 text-sm hover:border-indigo-500/40 transition">
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
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/40 p-4 rounded-2xl glass-panel relative z-10">
        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {REGIONS.map(region => (
            <button key={region} onClick={() => setFilterRegion(region)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                filterRegion === region
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
              }`}>
              {region}
            </button>
          ))}
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <span className="text-sm font-medium text-slate-400">Sort by:</span>
          <select value={sortOption} onChange={e => setSortOption(e.target.value)}
            className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none">
            <option value="stress_desc">Stress Score ↓</option>
            <option value="stress_asc">Stress Score ↑</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
        {displayedCountries.map((c, index) => (
          <CountryCard key={c.iso_code} country={c} rank={index + 1} animationDelay={index}
            isWatched={isWatched(c.iso_code)} onWatchToggle={() => toggle(c.iso_code)} />
        ))}
      </div>
    </motion.div>
  );
};

export default Home;
