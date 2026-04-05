import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const INDICATOR_META = {
  inflation: { label: 'Inflation', color: '#f43f5e', weight: 0.35 },
  fx_volatility: { label: 'FX Volatility', color: '#f59e0b', weight: 0.30 },
  reserves: { label: 'Reserves', color: '#10b981', weight: 0.15 },
  current_account: { label: 'Current Account', color: '#6366f1', weight: 0.10 },
  debt_gdp: { label: 'Debt/GDP', color: '#06b6d4', weight: 0.10 },
};

const IndicatorBreakdown = ({ indicators }) => {
  const data = useMemo(() => {
    if (!indicators) return [];
    return Object.entries(INDICATOR_META).map(([key, meta]) => {
      const val = indicators[key]?.value;
      // Normalize contribution using weight × |z_proxy|
      const proxy = Math.abs(parseFloat(val) || 0);
      return {
        name: meta.label,
        value: parseFloat((meta.weight * Math.min(proxy, 100)).toFixed(1)) || meta.weight * 20,
        color: meta.color,
        raw: val,
        weight: `${(meta.weight * 100).toFixed(0)}%`,
      };
    });
  }, [indicators]);

  const topDriver = data.reduce((a, b) => (a.value > b.value ? a : b), data[0]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-xl text-sm">
          <p className="font-bold text-white">{d.name}</p>
          <p className="text-slate-400">Model weight: <span className="text-white">{d.weight}</span></p>
          <p className="text-slate-400">Raw value: <span className="text-white">{d.raw !== undefined ? parseFloat(d.raw).toFixed(2) : '--'}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Risk Drivers</h3>
        {topDriver && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Top: {topDriver.name}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-4">Indicator contribution to composite stress score</p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-slate-300 text-xs font-medium">{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default IndicatorBreakdown;
