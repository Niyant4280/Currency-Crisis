import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WEIGHTS = {
  inflation: 0.30,
  reserves: 0.25,
  debt_gdp: 0.20,
  current_account: 0.15,
  fx_volatility: 0.10
};

// Critical thresholds (standard deviations from mean)
const Z_THRESHOLDS = {
  low: -1,
  mod: 1,
  high: 2,
  critical: 3
};

const ScenarioSimulator = ({ currentIndicators, onSimulate }) => {
  const [vals, setVals] = useState({
    inflation: currentIndicators?.inflation?.value || 5,
    reserves: (currentIndicators?.reserves?.value || 10e9) / 1e9, // Billion
    debt_gdp: currentIndicators?.debt_gdp?.value || 40,
    current_account: currentIndicators?.current_account?.value || -2,
    fx_volatility: currentIndicators?.fx_volatility?.value || 2,
  });

  const [simulatedScore, setSimulatedScore] = useState(0);

  // Simplified simulator logic: 
  // We simulate "Delta" from a healthy baseline (z=0)
  const calculateSimulatedScore = () => {
    // 1. Convert absolute values to estimated Z-scores based on global healthy means
    // This is a "Sandbox" estimation model
    let raw = 0;
    
    // Inflation (Healthy: 2%, Volatile: 15%+)
    const zInf = (vals.inflation - 2) / 10;
    raw += WEIGHTS.inflation * zInf;

    // FX Volatility (Healthy: 0.5%, Volatile: 5%+)
    const zVol = (vals.fx_volatility - 1) / 3;
    raw += WEIGHTS.fx_volatility * zVol;

    // Debt/GDP (Healthy: 40%, Risky: 100%+)
    const zDebt = (vals.debt_gdp - 50) / 40;
    raw += WEIGHTS.debt_gdp * zDebt;

    // Reserves (Inverse: More is better. Healthy: 50B, Low: 5B)
    const zRes = (vals.reserves - 40) / 30;
    raw -= WEIGHTS.reserves * zRes; // Negative weight: higher reserves = lower stress

    // Current Account (Inverse: Surplus is better. Healthy: +2%, Crisis: -8%)
    const zCA = (vals.current_account - 0) / 5;
    raw -= WEIGHTS.current_account * zCA; // Negative weight

    // Normalize to 0-100 (same as backend)
    const score = Math.min(Math.max(((raw + 3) / 6) * 100, 0), 100);
    setSimulatedScore(score);
    onSimulate(score);
  };

  useEffect(() => {
    calculateSimulatedScore();
  }, [vals]);

  const Slider = ({ id, label, min, max, step, unit }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium uppercase tracking-wider">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-bold">{vals[id]}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} 
        value={vals[id]} 
        onChange={(e) => setVals(v => ({...v, [id]: parseFloat(e.target.value)}))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/10">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">🛠️</div>
        <h3 className="text-lg font-bold text-white tracking-tight">Scenario Sandbox</h3>
      </div>
      
      <div className="space-y-6">
        <Slider id="inflation" label="Inflation Rate" min={0} max={100} step={0.5} unit="%" />
        <Slider id="fx_volatility" label="FX Volatility" min={0} max={20} step={0.1} unit="%" />
        <Slider id="debt_gdp" label="Debt to GDP" min={0} max={200} step={1} unit="%" />
        <Slider id="reserves" label="Foreign Reserves" min={0} max={500} step={1} unit="B" />
        <Slider id="current_account" label="Current Account" min={-15} max={15} step={0.5} unit="%" />
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Simulated Risk</p>
          <p className={`text-2xl font-black mt-1 ${
            simulatedScore > 75 ? 'text-rose-400' : simulatedScore > 55 ? 'text-orange-400' : simulatedScore > 30 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {simulatedScore.toFixed(1)}
          </p>
        </div>
        <button 
          onClick={() => setVals({
            inflation: currentIndicators?.inflation?.value || 5,
            reserves: (currentIndicators?.reserves?.value || 10e9) / 1e9,
            debt_gdp: currentIndicators?.debt_gdp?.value || 40,
            current_account: currentIndicators?.current_account?.value || -2,
            fx_volatility: currentIndicators?.fx_volatility?.value || 2,
          })}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition shadow-lg"
        >
          RESET
        </button>
      </div>

      <p className="mt-4 text-[10px] text-slate-500 leading-relaxed italic">
        * Move sliders to stress-test the economy. Higher scores indicate increased probability of a currency crisis within 12 months.
      </p>
    </div>
  );
};

export default ScenarioSimulator;
