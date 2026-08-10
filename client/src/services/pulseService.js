import api from './api';

export const getPulse = (params) => api.get('/pulse', { params }).then((res) => res.data);