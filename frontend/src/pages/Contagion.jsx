import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ContagionHeatmap = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCell, setHoveredCell] = useState(null);

    // Limit to top 12 for high-end matrix readability
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getLeaderboard();
                setCountries(response.data.data.slice(0, 10));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate simulated correlation score (0 to 1) based on region + risk levels
    const getCorrelation = (c1, c2) => {
        if (c1.country_code === c2.country_code) return 1.0;
        
        let score = 0.2; // Baseline
        // Regional linkage
        if (c1.region === c2.region) score += 0.4;
        // Risk similarity
        if (c1.risk_level === c2.risk_level) score += 0.2;
        // Proximity (Manual overrides for high contagion pairs)
        const pairs = [
            ['IND', 'PAK'], ['TUR', 'EGY'], ['ARG', 'BRA'], ['THA', 'VNM'], ['UKR', 'ROU']
        ];
        if (pairs.some(p => p.includes(c1.country_code) && p.includes(c2.country_code))) score += 0.3;
        
        return Math.min(score, 0.95);
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-indigo-400 font-bold">Initializing Contagion Matrix...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-white tracking-tight">Geopolitical Contagion Heatmap</h1>
                <p className="text-slate-400 mt-2 font-medium max-w-2xl">
                    Analyzing systemic risk linkages. This matrix shows the correlation in macroeconomic stress between nations. High scores indicate high probability of regional risk spillover.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-4 md:hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                            <svg className="w-4 h-4 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            Swipe to Explore Matrix
                        </span>
                    </div>

                    <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-indigo-500/20">
                        <div className="min-w-[800px] border border-slate-800 rounded-3xl p-8 bg-slate-900/40 relative backdrop-blur-xl">
                            {/* Table Header (Top) */}
                            <div className="flex mb-6 ml-24">
                            {countries.map(c => (
                                <div key={c.country_code} className="flex-1 text-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase rotate-[30deg] block mb-2">{c.country_code}</span>
                                </div>
                            ))}
                        </div>

                        {/* Matrix Rows */}
                        {countries.map((cRow, rIdx) => (
                            <div key={cRow.country_code} className="flex h-12 items-center">
                                {/* Row Header (Left) */}
                                <div className="w-24 text-right pr-4">
                                     <span className="text-xs font-black text-slate-400 tracking-tighter uppercase">{cRow.country_name}</span>
                                </div>
                                
                                {countries.map((cCol, cIdx) => {
                                    const corr = getCorrelation(cRow, cCol);
                                    return (
                                        <motion.div 
                                            key={cCol.country_code}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (rIdx * cIdx) * 0.005 }}
                                            onMouseEnter={() => setHoveredCell({ r: cRow, c: cCol, corr })}
                                            onMouseLeave={() => setHoveredCell(null)}
                                            className="flex-1 h-full m-0.5 rounded-sm cursor-crosshair transition-all hover:scale-105 hover:z-10 relative"
                                            style={{ 
                                                backgroundColor: `rgba(79, 70, 229, ${corr})`,
                                                boxShadow: corr > 0.8 ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none'
                                            }}
                                        >
                                            {corr > 0.8 && <div className="absolute inset-0 bg-white/5 animate-pulse"></div>}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between px-4">
                        <div className="flex items-center space-x-2">
                             <div className="w-4 h-4 bg-indigo-500/20 rounded"></div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Low Correlation</span>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-indigo-500/10 to-indigo-600 rounded"></div>
                        <div className="flex items-center space-x-2">
                             <div className="w-4 h-4 bg-indigo-600/90 rounded shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Systemic Linkage</span>
                        </div>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <AnimatePresence mode='wait'>
                        {hoveredCell ? (
                            <motion.div 
                                key="active"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass-card p-6 border-indigo-500/30"
                            >
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Correlation Profile</h4>
                                <p className="text-white text-lg font-bold leading-tight mb-4">
                                    {hoveredCell.r.country_code} × {hoveredCell.c.country_code}
                                </p>
                                <div className="space-y-4">
                                     <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Linkage Factor</p>
                                        <p className="text-3xl font-black text-indigo-400">{(hoveredCell.corr * 100).toFixed(0)}%</p>
                                     </div>
                                     <p className="text-slate-300 text-xs leading-relaxed italic">
                                         {hoveredCell.corr > 0.8 ? 
                                            `Strong regional linkage detected. A crisis in ${hoveredCell.r.country_name} represents an immediate threat to the ${hoveredCell.c.country_name} economy.` : 
                                            `Moderate decoupling. Macroeconomic trends in these two nations show independence despite shared global market forces.`
                                         }
                                     </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass-card p-6 border-slate-700/30 bg-slate-900/20">
                                <p className="text-slate-500 text-xs italic">Hover over the matrix cells to analyze contagion vectors.</p>
                            </div>
                        )}
                    </AnimatePresence>

                    <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                        <h5 className="text-white font-bold text-sm mb-2 italic">Contagion Tip</h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                            Systemic risk tends to spike during FOMC meetings. Cross-border correlation in EM debt usually tightens when USD strength increases.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContagionHeatmap;
