import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchPalette from './SearchPalette';
import { getLeaderboard } from '../services/api';

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getLeaderboard().then(res => {
      setCountries(res.data.data.map(c => ({
        iso_code: c.country_code, name: c.country_name,
        currency: c.currency_code, latest_stress_score: c.score, risk_level: c.risk_level
      })));
    }).catch(() => {});
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navItem = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] border border-indigo-500/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 glass-panel border-b border-slate-700/50 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center space-x-3 cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-glow tracking-tight group-hover:drop-shadow-lg transition">CrisisMonitor</span>
                  <span className="text-[0.65rem] text-slate-400 font-medium uppercase tracking-wider">Macroeconomic Early Warning</span>
                </div>
              </NavLink>
            </div>

            <div className="flex items-center space-x-2">
              <NavLink to="/dashboard" className={navItem} end>Dashboard</NavLink>
              <NavLink to="/map" className={navItem}>🗺 Map</NavLink>
              <NavLink to="/compare" className={navItem}>⚖️ Compare</NavLink>
              <NavLink to="/calendar" className={navItem}>📅 Calendar</NavLink>
              <NavLink to="/contagion" className={navItem}>🔗 Contagion</NavLink>
              <NavLink to="/features" className={navItem}>🚀 Features</NavLink>
              <NavLink to="/crisis-history" className={navItem}>📜 History</NavLink>

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white text-sm transition border border-slate-700/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden md:block">Search</span>
                <kbd className="hidden md:inline text-xs bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">⌘K</kbd>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <SearchPalette countries={countries} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
