import React, { useState, useEffect } from 'react';
import { getCrisisHistory } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CrisisHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getCrisisHistory();
        const formattedHistory = res.data.data.map(crisis => {
          const paramsArray = Object.entries(crisis.indicators_at_peak || {}).map(([key, value]) => ({
            name: key.replace('_', ' ').toUpperCase(),
            value: value
          }));
          return { ...crisis, parameters: paramsArray };
        });
        setHistory(formattedHistory);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 max-w-6xl mx-auto py-6"
    >
      <div className="text-center p-8 bg-gradient-to-b from-slate-800/80 to-transparent rounded-3xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 text-glow">Historical Crises Context</h1>
        <p className="text-slate-400 max-w-2xl mx-auto font-medium text-lg">
          Analyzing past currency crunches to calibrate modern warning indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {history.map((crisis, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="glass-card flex flex-col h-full border-t-4 border-t-rose-500 overflow-hidden relative group"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500 blur-[80px] opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>

            <div className="p-8 flex-grow z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{crisis.country}</h3>
                  <p className="text-slate-400 font-medium text-sm tracking-wider uppercase mt-1">{crisis.event_name}</p>
                </div>
                <span className="px-5 py-2 bg-rose-500/10 text-rose-400 rounded-full text-lg font-bold border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                  {crisis.year}
                </span>
              </div>
              
              <div className="bg-slate-900/50 p-5 rounded-2xl mb-8 border border-slate-700/50 shadow-inner">
                <p className="text-slate-300 leading-relaxed font-medium">
                  {crisis.description}
                </p>
              </div>

              <div>
                <h4 className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-4 pl-2 border-l-2 border-indigo-500">Economic Parameters</h4>
                <div className="h-48 w-full bg-slate-900/30 rounded-xl p-4 border border-slate-700/30">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={crisis.parameters}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#e2e8f0" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '0.75rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                        {crisis.parameters.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CrisisHistory;
