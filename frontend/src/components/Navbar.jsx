import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchPalette from './SearchPalette';
import { getLeaderboard } from '../services/api';

const NavDropdown = ({ title, children, icon }) => {
  const [open, setOpen] = useState(false);
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${open ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
        <span>{icon}</span>
        <span>{title}</span>
        <svg className={`w-3 h-3 ml-1 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      {open && (
        <div 
          className="absolute left-0 top-full pt-2 w-48 z-[60]"
        >
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="glass-panel border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="py-2 flex flex-col">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

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

  const dropdownItem = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium transition-all ${
      isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-panel border-b border-slate-700/50 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center space-x-3 cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-glow tracking-tight group-hover:drop-shadow-lg transition">CrisisMonitor</span>
                  <span className="text-[0.65rem] text-slate-400 font-medium uppercase tracking-wider">Early Warning Intelligence</span>
                </div>
              </NavLink>
            </div>

            <div className="flex items-center space-x-1">
              <NavLink to="/dashboard" className={navItem} end>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Dashboard</span>
                </div>
              </NavLink>

              <NavDropdown title="Visual Suite" icon="🎨">
                <NavLink to="/globe" className={dropdownItem}>🌐 3D Globe</NavLink>
                <NavLink to="/map" className={dropdownItem}>🗺 Risk Map</NavLink>
              </NavDropdown>

              <NavDropdown title="Intelligence" icon="🧠">
                <NavLink to="/compare" className={dropdownItem}>⚖️ Portfolio Compare</NavLink>
                <NavLink to="/contagion" className={dropdownItem}>🔗 Contagion Network</NavLink>
                <NavLink to="/calendar" className={dropdownItem}>📅 Macro Calendar</NavLink>
              </NavDropdown>

              <NavDropdown title="Resources" icon="📚">
                <NavLink to="/features" className={dropdownItem}>🚀 Capabilities</NavLink>
                <NavLink to="/crisis-history" className={dropdownItem}>📜 Crisis History</NavLink>
              </NavDropdown>

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="ml-2 flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white text-xs transition border border-slate-700/50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <kbd className="hidden md:inline text-[9px] bg-slate-700 px-1 py-0.5 rounded border border-slate-600 font-black">CMD+K</kbd>
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
