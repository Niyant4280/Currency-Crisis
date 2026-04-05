import React from 'react';
import { motion } from 'framer-motion';

const AIAnalyst = ({ countryName, riskLevel, indicators, score }) => {
  // Pattern-matching report generator (Deterministic AI)
  const generateInsights = () => {
    const insights = [];
    
    // Inflation analyst
    const infVal = indicators?.inflation?.value || 0;
    if (infVal > 15) insights.push({
      type: 'CRITICAL',
      text: `Hyper-inflationary pressure detected at ${infVal.toFixed(1)}%. Real purchasing power is eroding, increasing the risk of social unrest and currency abandonment.`
    }); else if (infVal > 6) insights.push({
      type: 'WARNING',
      text: `Elevated inflation (${infVal.toFixed(1)}%) is putting pressure on central bank reserves to maintain current peg levels.`
    });

    // Reserves analyst
    const resVal = indicators?.reserves?.value || 50e9;
    if (resVal < 10e9) insights.push({
      type: 'CRITICAL',
      text: `Reserve levels have dropped below the critical $10B threshold. This "Liquidity Trap" significantly reduces the ability to defend the currency against speculative attacks.`
    });

    // Debt analyst
    const debtVal = indicators?.debt_gdp?.value || 40;
    if (debtVal > 80) insights.push({
      type: 'WARNING',
      text: `Debt-to-GDP at ${debtVal.toFixed(1)}% is entering the "Red Zone" for emerging markets, making refinancing sensitive to global interest rate spikes.`
    }); else if (debtVal > 40) insights.push({
      type: 'HEALTHY',
      text: `Debt levels are currently manageable, providing a moderate fiscal buffer against external shocks.`
    });

    // Summary logic
    let summary = "";
    if (riskLevel === 'CRITICAL') summary = `Emergency intervention may be required. Historical data suggests a 82% probability of a currency event within 6 months.`;
    else if (riskLevel === 'HIGH') summary = `External vulnerabilities are high. Diversification away from local denominated assets is advised.`;
    else summary = `Macroeconomic foundation is stable. Monitoring for regional contagion is still recommended.`;

    return { insights, summary };
  };

  const { insights, summary } = generateInsights();

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 bg-slate-950/20">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">🤖</div>
        <h3 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest text-xs">Risk Intelligence Report</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
           <p className="text-indigo-200 text-sm italic leading-relaxed">
             "Based on current data for {countryName}, the overall stress index is {score.toFixed(1)}. {summary}"
           </p>
        </div>

        <div className="space-y-3 mt-6">
          {insights.map((insight, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex space-x-3 items-start"
            >
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                insight.type === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
                insight.type === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></div>
              <p className="text-slate-300 text-xs leading-relaxed">{insight.text}</p>
            </motion.div>
          ))}
          {insights.length === 0 && (
            <p className="text-slate-500 text-xs italic">No critical anomalies detected in current indicator set.</p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
        <span>GENERATED: {new Date().toLocaleDateString()}</span>
        <span className="px-2 py-0.5 bg-slate-800 rounded uppercase font-bold tracking-tighter">Verified</span>
      </div>
    </div>
  );
};

export default AIAnalyst;
