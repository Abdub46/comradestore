import api from './api';

export const sendSuggestion = (message) => api.post('/suggestions', { message }).then((res) => res.data);