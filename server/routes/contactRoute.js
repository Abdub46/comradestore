const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/security');

router.post('/', contactLimiter, sendContactMessage);

module.exports = router;