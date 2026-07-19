const axios = require('axios');

// Sandbox vs Production base URL, switched via MPESA_ENV in .env
const BASE_URL =
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// Fetches a fresh OAuth access token from Daraja (required before any STK push call)
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const { data } = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return data.access_token;
}

// Builds the timestamp in the exact format Daraja expects: YYYYMMDDHHmmss
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

// Builds the Base64 password: Shortcode + Passkey + Timestamp
function getPassword(timestamp) {
  return Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');
}

module.exports = { BASE_URL, getAccessToken, getTimestamp, getPassword };
