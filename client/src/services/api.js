import axios from 'axios';

// In local dev, VITE_API_URL is unset, so this falls back to '/api',
// which Vite's dev server proxies to localhost:5000 (see vite.config.js).
// In production (Vercel), VITE_API_URL is set to the live Render backend URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the JWT token (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token has expired/is invalid, clear it and send the user to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
