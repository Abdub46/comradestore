const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', getSettings);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;