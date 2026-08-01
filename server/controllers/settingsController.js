const Settings = require('../models/Settings');
const { isValidEmailFormat } = require('../utils/validators');

// @desc    Get current site settings
//          Public so every visitor's page load can check maintenanceMode.
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    const { maintenanceMode, maintenanceMessage, contactEmail } = req.body;

    if (contactEmail && !isValidEmailFormat(contactEmail)) {
      return res.status(400).json({ message: 'Please enter a valid contact email' });
    }

    const settings = await Settings.getSingleton();

    if (typeof maintenanceMode === 'boolean') {
      settings.maintenanceMode = maintenanceMode;
    }
    if (typeof maintenanceMessage === 'string' && maintenanceMessage.trim()) {
      settings.maintenanceMessage = maintenanceMessage.trim().slice(0, 300);
    }
    if (contactEmail) {
      settings.contactEmail = contactEmail.trim().toLowerCase();
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };