import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const GlossaryCard = ({ title, icon, color, description, impact }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card p-6 flex flex-col justify-start h-full group relative overflow-hidden"
  >
    {/* Ambient Glow */}
    <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-10 rounded-full transition duration-500 group-hover:opacity-20 ${color}`}></div>

    <div className="flex items-center space-x-4 mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-slate-700/50 bg-slate-800`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
    </div>
    <div className="space-y-4 relative z-10">
      <p className="text-slate-400 font-medium leading-relaxed text-sm">
        {description}
      </p>
      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1 block">Why it matters:</span>
        <p className="text-slate-300 text-sm font-medium">{impact}</p>
      </div>
    </div>
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-24 pb-12 pt-10">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="inline-block relative">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-8 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] filter"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
              <path d="M12 12v.01" strokeWidth="4" className="text-cyan-400" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" fill="currentColor" fillOpacity="0.1" />
            </svg>
          </motion.div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight max-w-4xl mx-auto drop-shadow-lg">
          Predicting Financial <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">Storms</span> Before They Hit
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Explore our real-time Macroeconomic Early Warning System. We track hidden vulnerabilities and score sovereign risks utilizing advanced z-score composite models.
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all flex items-center space-x-2 mx-auto"
        >
          <span>Launch Crisis Monitor</span>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </motion.button>
      </motion.div>

      {/* Educational Primer */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="space-y-12"
      >
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 text-glow">What is a Currency Crisis?</h2>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            A currency crisis occurs when severe doubt exists about whether a country's central bank has sufficient foreign exchange reserves to maintain the country's fixed exchange rate. It is often triggered by sudden capital flight, resulting in a disastrous crash in the value of the national currency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          <GlossaryCard 
            title="Inflation" 
            icon="📉" 
            color="bg-rose-500"
            description="The rate at which the general level of prices for goods and services is rising. If unchecked, it erodes purchasing power."
            impact="Hyperinflation wipes out domestic savings and forces citizens to abandon the local currency for foreign assets like USD."
          />
          <GlossaryCard 
            title="FX Volatility" 
            icon="💱" 
            color="bg-amber-500"
            description="The standard deviation of daily exchange rate changes over a 90-day rolling window. High volatility implies market panic."
            impact="Makes importing essential goods (like fuel or medicine) disastrously unpredictable and expensive overnight."
          />
          <GlossaryCard 
            title="Foreign Reserves" 
            icon="💰" 
            color="bg-emerald-500"
            description="Foreign currencies (usually USD/EUR) and gold held by a central bank. Used to pay off international debts and support the local currency."
            impact="If reserves hit zero, the country literally cannot import life-saving supplies or back its currency—triggering default."
          />
          <GlossaryCard 
            title="Debt to GDP" 
            icon="🏛️" 
            color="bg-orange-500"
            description="The ratio between a country's government debt and its gross domestic product (economic output). Indicates the ability to pay back debts."
            impact="Values above 90% (especially in developing nations) hint that the government might be forced to default or print money."
          />
          <GlossaryCard 
            title="Current Account" 
            icon="🌍" 
            color="bg-cyan-500"
            description="A record of a country's international transactions. A deficit means the country imports more goods, services, and capital than it exports."
            impact="Sustained severe deficits require constant foreign borrowing. If that borrowing stops drying up, a currency collapse is imminent."
          />
          
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => navigate('/crisis-history')}
            className="glass-card p-6 flex flex-col items-center justify-center text-center cursor-pointer group bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Learn from History</h3>
            <p className="text-slate-400 font-medium text-sm">See how these parameters looked right before the 2022 Sri Lankan Collapse and 2018 Turkish Crisis.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
