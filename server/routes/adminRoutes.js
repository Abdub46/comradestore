const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getSignupStats,
  getAnalyticsOverview,
  getHealthStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/users', protect, adminOnly, getAllUsers);
router.get('/signup-stats', protect, adminOnly, getSignupStats);
router.get('/analytics', protect, adminOnly, getAnalyticsOverview);
router.get('/health', protect, adminOnly, getHealthStatus);

module.exports = router;