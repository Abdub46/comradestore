const express = require('express');
const router = express.Router();
const { initiateStkPush, mpesaCallback } = require('../controllers/mpesaController');

router.post('/stkpush', initiateStkPush);
router.post('/callback', mpesaCallback);

module.exports = router;
