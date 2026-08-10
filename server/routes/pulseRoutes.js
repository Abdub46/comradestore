const express = require('express');
const router = express.Router();
const { getPulse } = require('../controllers/pulseController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getPulse);

module.exports = router;