const { UAParser } = require('ua-parser-js');
const PageView = require('../models/PageView');

// @desc    Record a single page view. Called by the frontend on every
//          route change - fire-and-forget, never blocks navigation.
// @route   POST /api/analytics/track
// @access  Public
const trackPageView = async (req, res) => {
  try {
    const { path, sessionId } = req.body;

    if (!path || !sessionId) {
      return res.status(400).json({ message: 'path and sessionId are required' });
    }

    const parser = new UAParser(req.headers['user-agent']);
    const deviceType = parser.getDevice().type; // 'mobile' | 'tablet' | undefined

    const device = deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablet' : 'Desktop';

    await PageView.create({ path, sessionId, device });
    res.status(201).json({ message: 'tracked' });
  } catch (error) {
    // Analytics must never break the site - log it, but always respond OK
    console.error('Failed to track page view:', error.message);
    res.status(200).json({ message: 'ignored' });
  }
};

module.exports = { trackPageView };