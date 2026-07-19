import api from './api';

export const initiateStkPush = (phone, amount) =>
  api.post('/mpesa/stkpush', { phone, amount }).then((res) => res.data);
