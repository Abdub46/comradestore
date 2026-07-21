const express = require('express');
const router = express.Router();
const { getAllUsers, getSignupStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/users', protect, adminOnly, getAllUsers);
router.get('/signup-stats', protect, adminOnly, getSignupStats);

module.exports = router;