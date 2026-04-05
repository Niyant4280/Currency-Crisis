import React from 'react';

const LABELS = {
  inflation: 'Inflation (CPI %)',
  reserves: 'FX Reserves (USD)',
  debt_gdp: 'Debt to GDP (%)',
  current_account: 'Current Account (% GDP)',
  fx_volatility: 'FX Volatility (90d %)',
};

const formatValue = (type, val) => {
  if (val === null || val === undefined) return 'N/A';
  if (type === 'reserves') {
    // Format to Billions
    return `$ ${(val / 1e9).toFixed(1)} B`;
  }
  return `${val.toFixed(1)} %`;
};

const IndicatorCard = ({ type, data, zScore }) => {
  if (!data) return null;
  
  const value = data.value;
  const trend = data.trend;
  const isDanger = parseFloat(zScore) >= 1.5;

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-l-4 ${isDanger ? 'border-red-500' : 'border-slate-500'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-textMuted font-semibold tracking-wide uppercase">
          {LABELS[type]}
        </span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isDanger ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-300'}`}>
          Z: {zScore !== undefined ? zScore.toFixed(2) : 'N/A'}
        </span>
      </div>
      <div className="flex items-end space-x-2">
        <span className="text-2xl font-mono text-white">{formatValue(type, value)}</span>
        {trend && trend !== '—' && (
          <span className={`text-md mb-1 ${trend === '↑' ? (type === 'reserves' ? 'text-green-400' : 'text-red-400') : (type === 'reserves' ? 'text-red-400' : 'text-green-400')}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default IndicatorCard;
