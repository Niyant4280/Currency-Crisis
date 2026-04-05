import React, { useState, useEffect } from 'react';
import { getCalendar } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await getCalendar();
        setEvents(response.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  const filteredEvents = events.filter(e => filter === 'ALL' || e.impact === filter);

  if (loading) return <div className="flex justify-center items-center h-64 text-indigo-400 font-bold">Loading Macro Calendar...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Macro-Economic Calendar</h1>
          <p className="text-slate-400 mt-2 font-medium">Critical 2026 global events that impact currency stability.</p>
        </div>
        <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 space-y-12 pb-20">
        <AnimatePresence mode='popLayout'>
          {filteredEvents.map((event, idx) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Dot */}
              <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-slate-900 ${
                event.impact === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 
                event.impact === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500'
              }`}></div>

              <div className="glass-card p-6 border-slate-700/30 hover:border-indigo-500/30 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 md:mb-0">
                    <span className="text-sm font-black text-indigo-400 tracking-tighter uppercase px-2 py-1 bg-indigo-500/10 rounded">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-white font-black text-xl">{event.event}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    event.impact === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                    event.impact === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {event.impact} IMPACT
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                   <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                      {event.country === 'GLB' ? '🌐' : event.country}
                   </div>
                   <div>
                     <p className="text-slate-300 text-sm leading-relaxed mb-4">{event.description}</p>
                     <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status: Monitoring</span>
                     </div>
                   </div>
                </div>
                
                {/* Visual Connector */}
                <div className="absolute top-1/2 -right-4 w-12 h-12 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center text-slate-600 font-medium py-20">No macro events found for this criteria.</div>
      )}
    </div>
  );
};

export default Calendar;
