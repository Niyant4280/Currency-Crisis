import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const LABELS = {
  inflation: 'Inflation (%)',
  reserves: 'FX Reserves',
  debt_gdp: 'Debt/GDP (%)',
  current_account: 'Current Acc (%)',
  fx_volatility: 'FX Volatility',
};

const IndicatorChart = ({ type, historyRaw }) => {
  if (!historyRaw || historyRaw.length === 0) return <div className="h-48 flex items-center justify-center text-textMuted">No data</div>;

  // Process data for chart
  const data = historyRaw.map(item => ({
    year: new Date(item.recorded_date).getFullYear(),
    value: item.value,
  }));

  // Calculate Mean and STD to show danger band
  const values = data.map(d => d.value);
  const mean = values.reduce((a,b)=>a+b,0) / values.length;
  const std = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a,b)=>a+b,0) / values.length);
  
  // Danger zone > 1.5 STD in the negative direction for reserves/CA, positive for others.
  // Simplifying for generic visualization: highlight upper bounds for inflation/debt/volatility, and lower for reserves/CA.
  
  const isLowerDanger = type === 'reserves' || type === 'current_account';
  const dangerThreshold = isLowerDanger ? mean - (1.5 * std) : mean + (1.5 * std);

  return (
    <div className="bg-card rounded-xl p-4 border border-slate-700 h-64">
      <h3 className="text-sm font-semibold mb-2">{LABELS[type]} (10y Trend)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{fontSize: 12}} />
          <YAxis stroke="#94a3b8" tick={{fontSize: 12}} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            formatter={(val) => val.toFixed(1)}
          />
          <ReferenceArea 
            y1={isLowerDanger ? 'dataMin' : dangerThreshold} 
            y2={isLowerDanger ? dangerThreshold : 'dataMax'} 
            fill="red" fillOpacity={0.1} 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IndicatorChart;
