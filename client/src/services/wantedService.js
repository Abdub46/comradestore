import api from './api';

export const getWantedList = (params) => api.get('/wanted', { params }).then((res) => res.data);

export const getMyWanted = () => api.get('/wanted/my').then((res) => res.data);

export const createWanted = (data) => api.post('/wanted', data).then((res) => res.data);

export const updateWantedStatus = (id, status) =>
  api.patch(`/wanted/${id}/status`, { status }).then((res) => res.data);

export const deleteWanted = (id) => api.delete(`/wanted/${id}`).then((res) => res.data);