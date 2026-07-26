const mongoose = require('mongoose');
const User = require('../models/User');
const PageView = require('../models/PageView');
const cloudinary = require('../config/cloudinary');
const transporter = require('../config/mailer');

// @desc    Get every registered user's account details (admin only)
//          Passwords are never included - the User model's toJSON already
//          strips the password field automatically on every query.
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get signup counts grouped by month, for the trend graph
// @route   GET /api/admin/signup-stats
// @access  Private/Admin
const getSignupStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const formatted = stats.map((s) => ({
      month: `${monthNames[s._id.month - 1]} ${s._id.year}`,
      signups: s.count,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Real, self-hosted website performance analytics - visitor counts,
//          most visited pages, device breakdown, and a daily visitor trend.
//          Computed entirely from PageView documents this app already logs.
// @route   GET /api/admin/analytics
// @access  Private/Admin
async function getAnalyticsOverview(req, res, next) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6); // last 7 days, including today
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const distinctSessionsSince = async (since) => {
      const sessions = await PageView.distinct('sessionId', { createdAt: { $gte: since } });
      return sessions.length;
    };

    const [visitorsToday, visitorsThisWeek, visitorsThisMonth, totalPageViews] = await Promise.all([
      distinctSessionsSince(startOfToday),
      distinctSessionsSince(startOfWeek),
      distinctSessionsSince(startOfMonth),
      PageView.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    // Group this month's views by session, to compute avg pages/session and bounce rate
    const sessionCounts = await PageView.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$sessionId', views: { $sum: 1 } } },
    ]);

    const totalSessions = sessionCounts.length;
    const avgPagesPerSession =
      totalSessions > 0
        ? (sessionCounts.reduce((sum, s) => sum + s.views, 0) / totalSessions).toFixed(1)
        : '0';
    const bouncedSessions = sessionCounts.filter((s) => s.views === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    // Most visited pages this month
    const topPagesRaw = await PageView.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 6 },
    ]);
    const topPages = topPagesRaw.map((p) => ({ page: p._id, views: p.views }));

    // Device breakdown this month
    const deviceRaw = await PageView.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]);
    const devices = deviceRaw.map((d) => ({ name: d._id, value: d.count }));

    // Daily distinct-visitor trend, last 14 days
    const fourteenDaysAgo = new Date(startOfToday);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const dailyRaw = await PageView.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sessionId: '$sessionId',
          },
        },
      },
      { $group: { _id: '$_id.date', visitors: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const dailyTrend = dailyRaw.map((d) => ({ date: d._id, visitors: d.visitors }));

    res.json({
      performance: {
        visitorsToday,
        visitorsThisWeek,
        visitorsThisMonth,
        totalPageViews,
        avgPagesPerSession,
        bounceRate,
      },
      topPages,
      devices,
      dailyTrend,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Live health check of the backend's own core dependencies
// @route   GET /api/admin/health
// @access  Private/Admin
async function getHealthStatus(req, res) {
  const health = {
    backend: true, // this code is running, so the backend is definitionally up
    database: mongoose.connection.readyState === 1,
    cloudinary: false,
    email: false,
  };

  try {
    await cloudinary.api.ping();
    health.cloudinary = true;
  } catch (error) {
    health.cloudinary = false;
  }

  try {
    await transporter.verify();
    health.email = true;
  } catch (error) {
    health.email = false;
  }

  res.json(health);
}

module.exports = { getAllUsers, getSignupStats, getAnalyticsOverview, getHealthStatus };