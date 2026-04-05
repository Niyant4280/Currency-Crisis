import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { getLeaderboard } from '../services/api';
import { COUNTRY_COORDS } from '../constants/countries';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RiskGlobe = () => {
    const globeEl = useRef();
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getLeaderboard();
                const data = res.data.data;
                
                // Map API data to globe points using our coordinates constant
                const points = data.map(c => {
                    const coords = COUNTRY_COORDS[c.country_code];
                    if (!coords) return null;
                    return {
                        lat: coords[0],
                        lng: coords[1],
                        size: (c.score / 100) * 0.8 + 0.1, // Altitude based on stress
                        color: c.score > 75 ? '#f43f5e' : c.score > 55 ? '#fb923c' : c.score > 30 ? '#facc15' : '#10b981',
                        label: `${c.country_name}: ${c.score.toFixed(1)}`,
                        code: c.country_code
                    };
                }).filter(Boolean);

                setCountries(points);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
            globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
        }
    }, [loading]);

    if (loading) return <div className="flex justify-center items-center h-screen text-indigo-400 font-bold text-2xl animate-pulse">Initializing 3D Risk Matrix...</div>;

    return (
        <div className="relative w-full h-screen bg-[#020617] overflow-hidden">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                
                pointsData={countries}
                pointAltitude="size"
                pointColor="color"
                pointRadius={0.4}
                pointsMerge={true}
                pointLabel="label"
                onPointClick={(point) => navigate(`/country/${point.code}`)}
                
                labelsData={countries}
                labelLat={d => d.lat}
                labelLng={d => d.lng}
                labelText={d => d.code}
                labelSize={0.5}
                labelDotRadius={0.2}
                labelColor={() => 'rgba(255, 255, 255, 0.6)'}
                labelResolution={2}
            />

            {/* Overlay UI */}
            <div className="absolute top-6 left-6 right-6 md:top-10 md:left-10 md:right-auto z-10 pointer-events-none">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel p-5 md:p-8 border-l-4 border-indigo-500 max-w-md pointer-events-auto shadow-2xl backdrop-blur-2xl"
                >
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-2">Global Risk Sphere</h1>
                    <p className="text-slate-400 text-[10px] md:text-sm font-medium leading-relaxed">
                        A real-time 3D visualization of macroeconomic stress clusters. 
                        Taller, redder spikes indicate immediate systemic threat.
                    </p>
                    
                    <div className="mt-4 md:mt-8 flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
                         <div className="flex items-center space-x-2">
                             <div className="w-2 h-4 md:w-3 md:h-6 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></div>
                             <span className="text-[9px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Critical</span>
                         </div>
                         <div className="flex items-center space-x-2">
                             <div className="w-2 h-3 md:w-3 md:h-5 bg-orange-500 rounded-full"></div>
                             <span className="text-[9px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Warning</span>
                         </div>
                         <div className="flex items-center space-x-2">
                             <div className="w-2 h-2 md:w-3 md:h-3 bg-emerald-500 rounded-full"></div>
                             <span className="text-[9px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Stable</span>
                         </div>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:right-10 md:left-auto z-10 text-center md:text-right pointer-events-none">
                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Institutional Advisory</p>
                <p className="text-white/40 text-[9px] md:text-[11px] bg-black/40 px-3 py-1.5 rounded-full border border-white/5 inline-block backdrop-blur-md">Drag to rotate • Zoom to explore • Click points for details</p>
            </div>
            
            {/* Visual Flare */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
    );
};

export default RiskGlobe;
