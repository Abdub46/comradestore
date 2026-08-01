const express = require('express');
const router = express.Router();
const {
  getErrorLogs,
  deleteErrorLog,
  clearErrorLogs,
  reportClientError,
} = require('../controllers/errorLogController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { clientErrorLimiter } = require('../middleware/security');

router.post('/client', clientErrorLimiter, reportClientError);
router.get('/', protect, adminOnly, getErrorLogs);
router.delete('/:id', protect, adminOnly, deleteErrorLog);
router.delete('/', protect, adminOnly, clearErrorLogs);

module.exports = router;