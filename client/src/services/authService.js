import api from './api';

export const register = (data) => api.post('/auth/register', data).then((res) => res.data);

export const login = (data) => api.post('/auth/login', data).then((res) => res.data);

export const getProfile = () => api.get('/auth/profile').then((res) => res.data);

export const updateProfile = (data) => api.put('/auth/profile', data).then((res) => res.data);
