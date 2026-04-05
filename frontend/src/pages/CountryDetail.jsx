import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCountry, getCountryIndicators, getCountryStressHistory, getLeaderboard } from '../services/api';
import StressGauge from '../components/StressGauge';
import NewsFeed from '../components/NewsFeed';
import IndicatorBreakdown from '../components/IndicatorBreakdown';
import StressCalendar from '../components/StressCalendar';
import ScenarioSimulator from '../components/ScenarioSimulator';
import AIAnalyst from '../components/AIAnalyst';
import { ISO_TO_FLAG } from '../constants/countries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getRiskBadge = (level) => {
  switch (level) {
    case 'CRITICAL': return 'badge-critical';
    case 'HIGH': return 'badge-high';
    case 'MEDIUM': return 'badge-medium';
    case 'LOW': return 'badge-low';
    default: return 'badge-unknown';
  }
};

const isoToFlag = ISO_TO_FLAG;

const IndicatorCard = ({ title, value, unit, icon, delay }) => {
  const display = (value !== null && value !== undefined && !isNaN(parseFloat(value)))
    ? parseFloat(value).toFixed(2)
    : '--';
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ scale: 1.05 }}
      className="glass-card p-6 h-full flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-slate-400 font-medium text-sm tracking-wide">{title}</h4>
        <div className="text-2xl opacity-50">{icon}</div>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-3xl font-bold text-white tracking-tight">{display}</span>
        <span className="text-slate-400 font-medium text-sm">{unit}</span>
      </div>
    </motion.div>
  );
};

const CountryDetail = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [country, setCountry] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [stressHistory, setStressHistory] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulatedScore, setSimulatedScore] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, iRes, sRes, lRes] = await Promise.all([
          getCountry(code),
          getCountryIndicators(code),
          getCountryStressHistory(code),
          getLeaderboard()
        ]);
        setCountry(cRes.data.data);
        setIndicators(iRes.data.data);
        setStressHistory(sRes.data.data.map(h => ({
          year: new Date(h.computed_at || h.recorded_date).getFullYear(),
          score: h.score
        })));
        
        const board = lRes.data.data;
        const idx = board.findIndex(c => c.country_code === code.toUpperCase());
        setRank(idx >= 0 ? idx + 1 : '--');
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAll();
  }, [code]);

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
    </div>
  );
  
  if (!country) return <div className="text-center text-red-400 text-xl font-bold mt-20">Country not found</div>;

  const latestIndicators = {
    inflation: country.indicators?.inflation?.value,
    reserves: country.indicators?.reserves?.value,
    debt_gdp: country.indicators?.debt_gdp?.value,
    current_account: country.indicators?.current_account?.value,
    fx_volatility: country.indicators?.fx_volatility?.value,
  };

  const flagCode = isoToFlag[country.code] || 'un';

  const exportToCSV = () => {
    const rows = [['Year', 'Stress Score']];
    stressHistory.forEach(h => rows.push([h.year, h.score?.toFixed(2)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${country.code}_stress_history.csv`; a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text(`${country.name} — Risk Report`, 14, 20);
    doc.setFontSize(12); doc.setTextColor(150);
    doc.text(`Risk Level: ${country.latest_stress?.risk_level || 'N/A'}   Stress Score: ${(country.latest_stress?.score || 0).toFixed(1)}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Year', 'Stress Score']],
      body: stressHistory.map(h => [h.year, h.score?.toFixed(2)]),
      theme: 'striped',
    });
    doc.save(`${country.code}_risk_report.pdf`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center space-x-6 glass-panel p-6 rounded-3xl"
      >
        <button onClick={() => navigate(-1)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition shadow-inner">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center bg-slate-800">
             <span className={`fi fi-${flagCode} text-4xl`}></span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">{country.name}</h1>
          <div className="flex items-center space-x-3 mt-2">
            <span className={`px-4 py-1 rounded-full text-sm font-bold tracking-widest ${getRiskBadge(country.latest_stress?.risk_level)}`}>
              {country.latest_stress?.risk_level || 'UNKNOWN'} RISK
            </span>
            <span className="text-slate-400 font-semibold">{country.currency_code}</span>
          </div>
        </div>
        {/* Export Buttons */}
        <div className="ml-auto flex items-center space-x-2">
          <button onClick={exportToCSV} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm border border-slate-700/50 transition font-medium">📥 CSV</button>
          <button onClick={exportToPDF} className="px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-xl text-indigo-300 text-sm border border-indigo-500/30 transition font-medium">📄 PDF</button>
        </div>
      </motion.div>

      {/* Feature 1: Overview Grid + Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Gauge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1 glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none"></div>
               <div className="text-center relative z-10 w-full">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                   {simulatedScore !== null ? '⚡ Simulation Mode' : 'Live Risk Index'}
                 </p>
                 <StressGauge 
                   score={simulatedScore !== null ? simulatedScore : (country.latest_stress?.score || 0)} 
                   riskLevel={simulatedScore !== null ? (simulatedScore > 75 ? 'CRITICAL' : simulatedScore > 55 ? 'HIGH' : simulatedScore > 30 ? 'MEDIUM' : 'LOW') : (country.latest_stress?.risk_level || 'UNKNOWN')} 
                 />
                 {simulatedScore !== null && (
                   <button 
                     onClick={() => setSimulatedScore(null)}
                     className="mt-4 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition underline tracking-tighter"
                   >
                     EXIT SIMULATION
                   </button>
                 )}
               </div>
            </motion.div>

            {/* Indicators Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
              <IndicatorCard delay={0.1} title="Inflation" value={latestIndicators.inflation} unit="%" icon="📈" />
              <IndicatorCard delay={0.2} title="FX Volatility" value={latestIndicators.fx_volatility} unit="%" icon="💱" />
              <IndicatorCard delay={0.3} title="Debt to GDP" value={latestIndicators.debt_gdp} unit="%" icon="🏛️" />
              <IndicatorCard delay={0.4} title="Current Account" value={latestIndicators.current_account} unit="% GDP" icon="📉" />
              <IndicatorCard delay={0.5} title="FX Reserves" value={latestIndicators.reserves ? latestIndicators.reserves / 1e9 : null} unit="Billion USD" icon="💰" />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="glass-card p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-indigo-500/10 to-blue-500/10"
              >
                 <h4 className="text-slate-300 font-medium text-sm mb-2">Overall Rank</h4>
                 <span className="text-4xl font-bold text-glow">#{rank}</span>
              </motion.div>
            </div>
          </div>

          {/* Feature 9: Stress Heatmap Calendar */}
          <StressCalendar stressHistory={stressHistory} />
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <AIAnalyst 
             countryName={country.name}
             riskLevel={country.latest_stress?.risk_level}
             indicators={country.indicators}
             score={country.latest_stress?.score || 0}
           />
           <ScenarioSimulator 
             currentIndicators={country.indicators} 
             onSimulate={setSimulatedScore} 
           />
        </div>
      </div>

      {/* Time Series Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="glass-card p-8"
      >
        <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">10-Year Stress Trajectory</h3>
            <span className="text-sm font-medium text-slate-400 bg-slate-800 py-1 px-3 rounded-full border border-slate-700">Historical Context</span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stressHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '0.75rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 8, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Feature 10 + 6: Bottom grid — Indicator Breakdown + News Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        <IndicatorBreakdown indicators={country.indicators} />
        <NewsFeed countryName={country.name} countryCode={country.code} />
      </div>
    </div>
  );
};

export default CountryDetail;
