const express = require('express');
const router = express.Router();
const { getSellerIntelligence } = require('../controllers/sellerController');
const { protect } = require('../middleware/auth');

router.get('/intelligence', protect, getSellerIntelligence);

module.exports = router;