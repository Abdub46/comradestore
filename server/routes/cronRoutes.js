const express = require('express');
const router = express.Router();
const { runSoldReminders } = require('../controllers/cronController');
const cronAuth = require('../middleware/cronAuth');

router.get('/sold-reminders', cronAuth, runSoldReminders);

module.exports = router;