const Banner = require('../models/Banner');

// @desc    Get the current site-wide banner settings
//          Public so every visitor's page load can display it.
// @route   GET /api/banner
// @access  Public
const getBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findOne();
    res.json(banner || {});
  } catch (error) {
    next(error);
  }
};

// @desc    Update the site-wide banner settings (admin only)
//          Uses upsert so the very first save creates the document.
// @route   PUT /api/banner
// @access  Private/Admin
const updateBanner = async (req, res, next) => {
  try {
    const {
      text,
      linkUrl,
      linkText,
      backgroundColor,
      textColor,
      showLinkIcon,
      showCloseButton,
    } = req.body;

    const banner = await Banner.findOneAndUpdate(
      {},
      { text, linkUrl, linkText, backgroundColor, textColor, showLinkIcon, showCloseButton },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json(banner);
  } catch (error) {
    next(error);
  }
};

module.exports = { getBanner, updateBanner };