const express = require('express');
const router = express.Router();
const { initiateStkPush, mpesaCallback } = require('../controllers/mpesaController');
const { protect } = require('../middleware/auth');
const { mpesaLimiter } = require('../middleware/security');

router.post('/stkpush', protect, mpesaLimiter, initiateStkPush);
router.post('/callback', mpesaCallback);

module.exports = router;
