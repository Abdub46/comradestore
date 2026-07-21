const User = require('../models/User');

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

module.exports = { getAllUsers, getSignupStats };