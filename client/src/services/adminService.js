import api from './api';

export const getAllUsers = () => api.get('/admin/users').then((res) => res.data);

export const getSignupStats = () => api.get('/admin/signup-stats').then((res) => res.data);

export const getAnalyticsOverview = () => api.get('/admin/analytics').then((res) => res.data);

export const getHealthStatus = () => api.get('/admin/health').then((res) => res.data);