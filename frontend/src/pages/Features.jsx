import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, badge, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-8 group hover:border-indigo-500/50 transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
       <span className="text-8xl font-black text-white select-none">{icon}</span>
    </div>
    <div className="relative z-10">
      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
        {icon}
      </div>
      <div className="flex items-center space-x-3 mb-4">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded">
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
    </div>
  </motion.div>
);

const Features = () => {
  const navigate = useNavigate();
  
  const featureList = [
    {
      icon: "🌍",
      title: "Global Coverage",
      description: "Real-time monitoring of 35 diverse economies across Latin America, SE Asia, MENA, and Eastern Europe. Automated data syncing with the World Bank and global FX markets.",
      badge: "LIVE"
    },
    {
      icon: "🤖",
      title: "AI Risk Analyst",
      description: "Proprietary deterministic intelligence engine that converts complex Z-score indicators into human-readable risk reports, identifying the specific drivers of a country's instability.",
      badge: "NEW"
    },
    {
      icon: "🛠️",
      title: "Scenario Simulator",
      description: "An interactive institutional-grade sandbox. Manipulate 5 critical macroeconomic variables to see their immediate resulting impact on a nation's systemic stress level.",
      badge: "PREMIUM"
    },
    {
      icon: "🔗",
      title: "Contagion Heatmap",
      description: "Analyze cross-border risk spillover. Our correlation matrix maps how a crisis in one emerging market likely impacts its regional trading partners.",
      badge: "INSTITUTIONAL"
    },
    {
      icon: "📅",
      title: "Macro Calendar",
      description: "Stay ahead of market-moving events. Tracks Central Bank policy meetings, national elections, and IMF review missions for all monitored nations.",
      badge: "NEW"
    },
    {
      icon: "🔔",
      title: "Active Alerts",
      description: "Never miss a critical threshold crossing. Multi-channel notifications via Browser Push and Desktop Alerts for all countries in your watchlist.",
      badge: "ALERTS"
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black tracking-[0.2em] uppercase mb-8"
        >
          Institutional Risk Intelligence
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
          Beyond the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Dashboard.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-xl font-medium leading-relaxed">
          CrisisMonitor EWS combines big data, predictive modeling, and interactive simulations to provide a professional-grade early warning suite.
        </p>
      </section>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((f, i) => (
          <FeatureCard key={i} {...f} delay={i * 0.1} />
        ))}
      </div>

      {/* Call to Action */}
      <section className="mt-32 max-w-5xl mx-auto px-4">
        <div className="glass-card p-12 text-center border-indigo-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full translate-y-12"></div>
          <h2 className="relative z-10 text-4xl font-black text-white mb-6">Ready to monitor the global economy?</h2>
          <div className="relative z-10 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              GO TO DASHBOARD
            </button>
            <button 
              onClick={() => navigate('/map')}
              className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl transition-all border border-slate-700"
            >
              VIEW GLOBAL MAP
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
