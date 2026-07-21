import api from './api';

export const getAllUsers = () => api.get('/admin/users').then((res) => res.data);

export const getSignupStats = () => api.get('/admin/signup-stats').then((res) => res.data);