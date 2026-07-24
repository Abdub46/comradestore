import api from './api';

export const getBanner = () => api.get('/banner').then((res) => res.data);

export const updateBanner = (data) => api.put('/banner', data).then((res) => res.data);