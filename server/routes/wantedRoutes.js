const express = require('express');
const router = express.Router();
const {
  createWanted,
  getWantedList,
  getMyWanted,
  updateWantedStatus,
  markWantedAsContacted,
  deleteWanted,
} = require('../controllers/wantedController');
const { protect } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/security');

router.get('/my', protect, getMyWanted);
router.get('/', getWantedList);
router.post('/', protect, createWanted);
router.patch('/:id/status', protect, updateWantedStatus);
router.patch('/:id/contact', contactLimiter, markWantedAsContacted);
router.delete('/:id', protect, deleteWanted);

module.exports = router;