import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const getCountries = () => api.get('/countries');
export const getCountry = (code) => api.get(`/countries/${code}`);
export const getCountryIndicators = (code) => api.get(`/countries/${code}/indicators`);
export const getCountryStressHistory = (code) => api.get(`/countries/${code}/stress-history`);
export const getLeaderboard = () => api.get('/leaderboard');
export const getCalendar = () => api.get('/calendar');
export const getCrisisHistory = () => api.get('/crisis-history');

export default api;
