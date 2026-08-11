const Wanted = require('../models/Wanted');
const Product = require('../models/Product');
const { stripHtml } = require('../utils/sanitize');
const { generateContactToken, verifyContactToken } = require('../utils/contactToken');

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
    // Default to only showing Active + Reserved on the public Wanted Board,
    // same as Product's Available + Reserved - a request being followed up
    // on is still worth other sellers seeing, only Fulfilled is hidden.
    const filter = { status: { $in: ['Active', 'Reserved'] } };
    if (residence) filter.residence = residence;
    if (category) filter.category = category;

    const requests = await Wanted.find(filter)
      .populate('user', 'firstName lastName phone avatar residence')
      .sort('-createdAt')
      .limit(60)
      .lean();

    // Computed fresh on every request (never cached) - proves to
    // markWantedAsContacted that this browser actually loaded the Wanted
    // Board recently, rather than blindly looping over IDs. Same pattern
    // as Product's contactToken.
    const withTokens = requests.map((wanted) => ({
      ...wanted,
      contactToken: generateContactToken(wanted._id.toString()),
    }));

    res.json(withTokens);
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

// @desc    Update a wanted request's status (Active / Reserved / Fulfilled)
// @route   PATCH /api/wanted/:id/status
// @access  Private (owner only)
const updateWantedStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Reserved', 'Fulfilled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const wanted = await Wanted.findById(req.params.id);
    if (!wanted) return res.status(404).json({ message: 'Wanted request not found' });

    if (wanted.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own requests' });
    }

    wanted.status = status;

    // Same reset logic as Product.updateProductStatus - each status keeps
    // only the timestamps that are actually relevant to it.
    if (status === 'Active') {
      // Fully reset - no reservation clock running
      wanted.fulfilledAt = null;
      wanted.contactedAt = null;
      wanted.reminderSent = false;
      wanted.reminderSentAt = null;
    } else if (status === 'Reserved') {
      // Manually reserving it (e.g. owner heard from a seller offline)
      // starts the same 24h-then-24h clock as a seller contacting them
      wanted.fulfilledAt = null;
      wanted.contactedAt = new Date();
      wanted.reminderSent = false;
      wanted.reminderSentAt = null;
    } else if (status === 'Fulfilled') {
      // Start the 2-day auto-delete timer; reservation clock no longer applies
      wanted.fulfilledAt = new Date();
      wanted.contactedAt = null;
      wanted.reminderSent = false;
      wanted.reminderSentAt = null;
    }

    await wanted.save();

    res.json(wanted);
  } catch (error) {
    next(error);
  }
};

// @desc    Flip a wanted request to Reserved as soon as a seller clicks
//          "Contact the Buyer". Starts a 24h-then-24h clock: reminder
//          email+notification at 24h if still Reserved, then auto-flips to
//          Fulfilled at 48h if still no action from the buyer (which then
//          auto-deletes 2 days later via the fulfilledAt TTL index).
// @route   PATCH /api/wanted/:id/contact
// @access  Public (protected by the short-lived contact token, not login)
const markWantedAsContacted = async (req, res, next) => {
  try {
    if (!verifyContactToken(req.params.id, req.body.contactToken)) {
      return res.status(403).json({ message: 'This link has expired - please refresh the Wanted Board and try again.' });
    }

    const wanted = await Wanted.findById(req.params.id);

    if (!wanted) {
      return res.status(404).json({ message: 'Wanted request not found' });
    }

    // Only start the clock the first time someone responds. If it's
    // already Reserved (an earlier seller already reached out) or already
    // Fulfilled, don't reset the timers - just let this seller's WhatsApp
    // message go through as normal without touching the request record.
    if (wanted.status === 'Active') {
      wanted.status = 'Reserved';
      wanted.contactedAt = new Date();
      wanted.reminderSent = false;
      wanted.reminderSentAt = null;
      await wanted.save();
    }

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
  markWantedAsContacted,
  deleteWanted,
};
