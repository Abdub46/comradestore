import api from './api';

export const getErrorLogs = () => api.get('/errors').then((res) => res.data);

export const deleteErrorLog = (id) => api.delete(`/errors/${id}`).then((res) => res.data);

export const clearErrorLogs = () => api.delete('/errors').then((res) => res.data);

// Fire-and-forget - reporting a crash should never itself throw
export const reportClientError = (data) =>
  api.post('/errors/client', data).then((res) => res.data).catch(() => {});