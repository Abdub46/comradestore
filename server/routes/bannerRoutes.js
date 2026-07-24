const express = require('express');
const router = express.Router();
const { getBanner, updateBanner } = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', getBanner);
router.put('/', protect, adminOnly, updateBanner);

module.exports = router;