import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../services/api';
import { NUMERIC_TO_ALPHA3 } from '../constants/countries';
import { Tooltip } from 'react-tooltip';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const colorScale = scaleLinear()
  .domain([0, 35, 55, 75, 100])
  .range(['#10b981', '#f59e0b', '#f97316', '#f43f5e', '#9f1239']);

const WorldMap = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(res => {
      const map = {};
      res.data.data.forEach(c => {
        map[c.country_code] = { score: c.score, name: c.country_name, risk: c.risk_level };
      });
      setScores(map);
      setLoading(false);
    });
  }, []);

  const getCountryData = (numericId) => {
    const alpha3 = NUMERIC_TO_ALPHA3[numericId?.toString().padStart(3, '0')];
    return alpha3 ? scores[alpha3] : null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:bg-slate-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Risk Map</h1>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            {['#10b981','#f59e0b','#f97316','#f43f5e'].map(c => (
              <div key={c} className="w-4 h-4 rounded" style={{ backgroundColor: c }}></div>
            ))}
          </div>
          <span>Low → Critical</span>
        </div>
      </div>

      <div className="glass-card p-4 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <ComposableMap projection="geoMercator" style={{ width: '100%', height: '500px' }}>
            <ZoomableGroup zoom={1} center={[0, 20]}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const data = getCountryData(geo.id);
                    const isMonitored = !!data;
                    const fillColor = data ? colorScale(data.score) : '#1e293b';

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          const alpha3 = NUMERIC_TO_ALPHA3[geo.id?.toString().padStart(3, '0')];
                          if (alpha3) navigate(`/country/${alpha3}`);
                        }}
                        style={{
                          default: {
                            fill: fillColor,
                            stroke: '#0f172a',
                            strokeWidth: 0.5,
                            outline: 'none',
                            cursor: isMonitored ? 'pointer' : 'default',
                          },
                          hover: {
                            fill: isMonitored ? fillColor : '#334155',
                            stroke: isMonitored ? '#fff' : '#0f172a',
                            strokeWidth: isMonitored ? 1.5 : 0.5,
                            outline: 'none',
                          },
                          pressed: { outline: 'none' }
                        }}
                        data-tooltip-id="map-tooltip"
                        data-tooltip-content={data ? `${data.name}: ${data.score?.toFixed(1)} (${data.risk})` : geo.properties?.name || ''}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        )}
        <Tooltip id="map-tooltip" className="!bg-slate-900 !border !border-slate-700 !rounded-xl !text-white !text-sm !font-medium" />
      </div>

      <p className="text-center text-slate-600 text-sm">Click on a highlighted country to view its full risk profile. Scroll to zoom.</p>
    </motion.div>
  );
};

export default WorldMap;
