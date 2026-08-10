import api from './api';

export const getSellerIntelligence = () => api.get('/seller/intelligence').then((res) => res.data);