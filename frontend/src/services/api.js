import axios from 'axios';

// Vercel Proxy handles CORS — all requests go through /api
const API_BASE = '/api';

// 60s timeout: Render free tier takes 30–50s to cold-start.
// Without this, the default 10s timeout always expires before the backend wakes up.
const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const getCountries = () => api.get('/countries');
export const getCountry = (code) => api.get(`/countries/${code}`);
export const getCountryIndicators = (code) => api.get(`/countries/${code}/indicators`);
export const getCountryStressHistory = (code) => api.get(`/countries/${code}/stress-history`);
export const getLeaderboard = () => api.get('/leaderboard');
export const getCalendar = () => api.get('/calendar');
export const getCrisisHistory = () => api.get('/crisis-history');

// Lightweight ping used to pre-warm the Render backend on app load
export const pingBackend = () => api.get('/status', { timeout: 60000 });

export default api;
