const express = require('express');
const router = express.Router();
const {
  createWanted,
  getWantedList,
  getMyWanted,
  updateWantedStatus,
  deleteWanted,
} = require('../controllers/wantedController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyWanted);
router.get('/', getWantedList);
router.post('/', protect, createWanted);
router.patch('/:id/status', protect, updateWantedStatus);
router.delete('/:id', protect, deleteWanted);

module.exports = router;