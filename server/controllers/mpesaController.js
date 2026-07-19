const axios = require('axios');
const { BASE_URL, getAccessToken, getTimestamp, getPassword } = require('../config/mpesa');
const { formatPhoneNumber, isValidKenyanPhone } = require('../utils/phoneFormatter');

// @desc    Trigger an STK Push prompt on the buyer's phone (Buy Me a Coffee)
// @route   POST /api/mpesa/stkpush
// @access  Public
const initiateStkPush = async (req, res, next) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ message: 'Phone number and amount are required' });
    }

    if (!isValidKenyanPhone(phone)) {
      return res.status(400).json({ message: 'Please enter a valid M-Pesa phone number' });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);
    const accessToken = await getAccessToken();

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(Number(amount)),
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'HomeMarket Coffee',
        TransactionDesc: 'Buy Me a Coffee',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // data includes CheckoutRequestID, MerchantRequestID, ResponseDescription, etc.
    res.json({
      message: 'STK push sent. Check your phone to enter your M-Pesa PIN.',
      data,
    });
  } catch (error) {
    // Daraja errors usually arrive in error.response.data
    const daraja = error.response?.data;
    console.error('M-Pesa STK Push error:', daraja || error.message);
    res.status(500).json({
      message: daraja?.errorMessage || 'Failed to initiate M-Pesa payment. Please try again.',
    });
  }
};

// @desc    Safaricom calls this URL automatically once the payment completes or fails
// @route   POST /api/mpesa/callback
// @access  Public (called by Safaricom's servers, not the browser)
const mpesaCallback = async (req, res) => {
  // For now this just logs the result. Safaricom requires a 200 response
  // regardless of outcome, or it will keep retrying the callback.
  console.log('M-Pesa callback received:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Callback received successfully' });
};

module.exports = { initiateStkPush, mpesaCallback };
