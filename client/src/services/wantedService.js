import api from './api';

export const getWantedList = (params) => api.get('/wanted', { params }).then((res) => res.data);

export const getMyWanted = () => api.get('/wanted/my').then((res) => res.data);

export const createWanted = (data) => api.post('/wanted', data).then((res) => res.data);

export const updateWantedStatus = (id, status) =>
  api.patch(`/wanted/${id}/status`, { status }).then((res) => res.data);

// Called when a seller clicks "Contact the Buyer" - no login required
export const markWantedAsContacted = (id, contactToken) =>
  api.patch(`/wanted/${id}/contact`, { contactToken }).then((res) => res.data);

export const deleteWanted = (id) => api.delete(`/wanted/${id}`).then((res) => res.data);