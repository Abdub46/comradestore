const express = require('express');
const router = express.Router();
const { trackPageView } = require('../controllers/analyticsController');
const { analyticsLimiter } = require('../middleware/security');

router.post('/track', analyticsLimiter, trackPageView);

module.exports = router;