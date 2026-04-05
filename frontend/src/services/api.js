import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const getCountries = () => api.get('/countries');
export const getCountry = (code) => api.get(`/countries/${code}`);
export const getCountryIndicators = (code) => api.get(`/countries/${code}/indicators`);
export const getCountryStressHistory = (code) => api.get(`/countries/${code}/stress-history`);
export const getLeaderboard = () => api.get('/leaderboard');
export const getCalendar = () => api.get('/calendar');
export const getCrisisHistory = () => api.get('/crisis-history');

export default api;
