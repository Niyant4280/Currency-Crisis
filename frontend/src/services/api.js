import axios from 'axios';

// Institutional Portfolio Suite - Deployment Version: v2.0.1 (Cache-Bust)
// Force absolute relative paths for the Vercel Proxy to handle CORS on the server-side
const API_BASE = '/api';


const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const getCountries = () => api.get('/countries');
export const getCountry = (code) => api.get(`/countries/${code}`);
export const getCountryIndicators = (code) => api.get(`/countries/${code}/indicators`);
export const getCountryStressHistory = (code) => api.get(`/countries/${code}/stress-history`);
export const getLeaderboard = () => api.get('/leaderboard');
export const getCalendar = () => api.get('/calendar');
export const getCrisisHistory = () => api.get('/crisis-history');

export default api;

