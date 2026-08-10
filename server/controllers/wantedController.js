const Wanted = require('../models/Wanted');
const Product = require('../models/Product');
const { stripHtml } = require('../utils/sanitize');

// @desc    Create a wanted request
// @route   POST /api/wanted
// @access  Private
const createWanted = async (req, res, next) => {
  try {
    const { title, description, category, minBudget, maxBudget, residence } = req.body;

    if (!title || !residence) {
      return res.status(400).json({ message: 'Please provide a title and residence' });
    }

    if (category && !Product.CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (!['Sokomoko', 'KU', 'Annex'].includes(residence)) {
      return res.status(400).json({ message: 'Please select a valid residence' });
    }

    const min = minBudget !== undefined && minBudget !== '' ? Number(minBudget) : null;
    const max = maxBudget !== undefined && maxBudget !== '' ? Number(maxBudget) : null;

    if (min != null && max != null && min > max) {
      return res.status(400).json({ message: 'Minimum budget cannot be greater than maximum budget' });
    }

    const wanted = await Wanted.create({
      user: req.user._id,
      title: stripHtml(title),
      description: description ? stripHtml(description) : '',
      category: category || null,
      minBudget: min,
      maxBudget: max,
      residence,
    });

    const populated = await wanted.populate('user', 'firstName lastName phone avatar residence');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Browse active wanted requests
// @route   GET /api/wanted?residence=&category=
// @access  Public
const getWantedList = async (req, res, next) => {
  try {
    const { residence, category } = req.query;
    const filter = { status: 'Active' };
    if (residence) filter.residence = residence;
    if (category) filter.category = category;

    const requests = await Wanted.find(filter)
      .populate('user', 'firstName lastName phone avatar residence')
      .sort('-createdAt')
      .limit(60);

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Get the logged-in user's own wanted requests (any status)
// @route   GET /api/wanted/my
// @access  Private
const getMyWanted = async (req, res, next) => {
  try {
    const requests = await Wanted.find({ user: req.user._id }).sort('-createdAt');
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a wanted request as Fulfilled or back to Active
// @route   PATCH /api/wanted/:id/status
// @access  Private (owner only)
const updateWantedStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Fulfilled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const wanted = await Wanted.findById(req.params.id);
    if (!wanted) return res.status(404).json({ message: 'Wanted request not found' });

    if (wanted.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own requests' });
    }

    wanted.status = status;
    await wanted.save();

    res.json(wanted);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a wanted request
// @route   DELETE /api/wanted/:id
// @access  Private (owner only)
const deleteWanted = async (req, res, next) => {
  try {
    const wanted = await Wanted.findById(req.params.id);
    if (!wanted) return res.status(404).json({ message: 'Wanted request not found' });

    if (wanted.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own requests' });
    }

    await wanted.deleteOne();

    res.json({ message: 'Wanted request removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWanted,
  getWantedList,
  getMyWanted,
  updateWantedStatus,
  deleteWanted,
};
