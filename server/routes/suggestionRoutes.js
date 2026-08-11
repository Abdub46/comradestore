const express = require('express');
const router = express.Router();
const { sendSuggestion } = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/security');

router.post('/', protect, contactLimiter, sendSuggestion);

module.exports = router;