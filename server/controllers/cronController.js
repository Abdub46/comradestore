const { runReservationLifecycleCheck } = require('../jobs/reservationLifecycleJob');

// @desc    Manually trigger the reservation-lifecycle check (for external
//          cron schedulers like cron-job.org, since Render's free tier can
//          put the server to sleep, so the in-process hourly job alone
//          isn't reliable). Safe to call as often as you like - each stage
//          only ever acts on a given product once per cycle.
//          Route name kept as "sold-reminders" for backwards compatibility
//          with any already-configured external scheduler URL.
// @route   GET /api/cron/sold-reminders?key=YOUR_CRON_SECRET
// @access  Private (secret key, not user login)
const runSoldReminders = async (req, res, next) => {
  try {
    await runReservationLifecycleCheck();
    res.json({ message: 'Reservation-lifecycle check completed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { runSoldReminders };