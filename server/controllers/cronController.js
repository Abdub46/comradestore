const { sendSoldReminders } = require('../jobs/soldReminderJob');

// @desc    Manually trigger the sold-reminder check (for external cron
//          schedulers like cron-job.org, since Render's free tier can put
//          the server to sleep, so the in-process hourly job alone isn't
//          reliable). Safe to call as often as you like - the job only
//          ever emails a given product once per Sold cycle.
// @route   GET /api/cron/sold-reminders?key=YOUR_CRON_SECRET
// @access  Private (secret key, not user login)
const runSoldReminders = async (req, res, next) => {
  try {
    await sendSoldReminders();
    res.json({ message: 'Sold-reminder check completed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { runSoldReminders };