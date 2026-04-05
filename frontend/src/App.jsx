import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import CountryDetail from './pages/CountryDetail';
import CrisisHistory from './pages/CrisisHistory';
import Compare from './pages/Compare';
import WorldMap from './pages/WorldMap';
import Calendar from './pages/Calendar';
import Contagion from './pages/Contagion';
import Features from './pages/Features';
import RiskGlobe from './pages/RiskGlobe';

function App() {
  return (
    <div className="min-h-screen bg-background text-textLight">
      <Toaster position="bottom-right" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/country/:code" element={<CountryDetail />} />
          <Route path="/crisis-history" element={<CrisisHistory />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/contagion" element={<Contagion />} />
          <Route path="/features" element={<Features />} />
          <Route path="/globe" element={<RiskGlobe />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
