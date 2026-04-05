import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, getCountryStressHistory } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const isoToFlag = {
  'IND': 'in', 'TUR': 'tr', 'ARG': 'ar', 'PAK': 'pk', 'LKA': 'lk',
  'EGY': 'eg', 'NGA': 'ng', 'BRA': 'br', 'ZAF': 'za', 'IDN': 'id',
  'MEX': 'mx', 'BGD': 'bd', 'GHA': 'gh', 'KEN': 'ke', 'PHL': 'ph'
};

const COLORS = ['#6366f1', '#f43f5e'];

const Compare = () => {
  const navigate = useNavigate();
  const [allCountries, setAllCountries] = useState([]);
  const [selected, setSelected] = useState(['TUR', 'ARG']);
  const [histories, setHistories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(res => {
      const mapped = res.data.data.map(c => ({
        iso_code: c.country_code, name: c.country_name,
        currency: c.currency_code, latest_stress_score: c.score, risk_level: c.risk_level
      }));
      setAllCountries(mapped);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const fetchHistories = async () => {
      const results = {};
      for (const code of selected) {
        if (code) {
          const res = await getCountryStressHistory(code);
          results[code] = res.data.data.map(h => ({
            year: new Date(h.computed_at || h.recorded_date).getFullYear(),
            score: h.score
          }));
        }
      }
      setHistories(results);
    };
    if (selected.some(Boolean)) fetchHistories();
  }, [selected]);

  // Merge histories into a single dataset by year
  const chartData = React.useMemo(() => {
    const years = new Set();
    Object.values(histories).forEach(h => h.forEach(d => years.add(d.year)));
    return Array.from(years).sort().map(year => {
      const row = { year };
      selected.forEach((code, i) => {
        const found = histories[code]?.find(d => d.year === year);
        if (found) row[code] = found.score;
      });
      return row;
    });
  }, [histories, selected]);

  const getCountry = (code) => allCountries.find(c => c.iso_code === code);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:bg-slate-700 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-3xl font-bold text-white tracking-tight">Country Comparison</h1>
      </div>

      {/* Selection */}
      <div className="grid grid-cols-2 gap-6">
        {[0, 1].map(i => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Country {i + 1}</span>
            </div>
            <select
              value={selected[i]}
              onChange={e => setSelected(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
              className="w-full bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {allCountries.map(c => (
                <option key={c.iso_code} value={c.iso_code}>{c.name} ({c.iso_code})</option>
              ))}
            </select>
            {selected[i] && getCountry(selected[i]) && (
              <div className="mt-3 flex items-center space-x-3">
                <span className={`fi fi-${isoToFlag[selected[i]] || 'un'} text-2xl`}></span>
                <div>
                  <p className="text-2xl font-bold text-white">{(getCountry(selected[i])?.latest_stress_score || 0).toFixed(1)}</p>
                  <p className="text-xs font-bold text-slate-400">{getCountry(selected[i])?.risk_level} RISK</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overlaid Chart */}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-white mb-6">Stress Score Trajectory</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {selected.map((code, i) => (
                  <linearGradient key={code} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: '#334155', borderRadius: '0.75rem' }} />
              <Legend formatter={(val) => <span className="text-slate-300 text-sm">{getCountry(val)?.name || val}</span>} />
              {selected.map((code, i) => code && (
                <Area key={code} type="monotone" dataKey={code} stroke={COLORS[i]} strokeWidth={3}
                  fill={`url(#grad${i})`} fillOpacity={1}
                  activeDot={{ r: 6, fill: COLORS[i], stroke: '#fff', strokeWidth: 2 }}
                  name={code}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat comparison cards */}
      <div className="grid grid-cols-2 gap-6">
        {selected.map((code, i) => {
          const c = getCountry(code);
          if (!c) return null;
          return (
            <motion.div key={code} whileHover={{ y: -3 }} onClick={() => navigate(`/country/${code}`)}
              className="glass-card p-5 cursor-pointer hover:border-indigo-500/30 transition"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className={`fi fi-${isoToFlag[code] || 'un'} text-3xl`}></span>
                <div>
                  <h4 className="font-bold text-white text-lg">{c.name}</h4>
                  <p className="text-slate-400 text-sm">{c.currency}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-xs">Stress Score</p>
                  <p className="text-3xl font-bold text-white">{(c.latest_stress_score || 0).toFixed(1)}</p>
                </div>
                <span style={{ color: COLORS[i] }} className="text-4xl font-black opacity-20">#{i + 1}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Compare;
