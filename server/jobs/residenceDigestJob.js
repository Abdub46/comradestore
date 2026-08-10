const cron = require('node-cron');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// How often we check for residence activity to digest. Grouping on this
// cadence (rather than notifying per-listing) is what keeps this useful
// instead of spammy.
const DIGEST_INTERVAL_CRON = '0 */6 * * *'; // every 6 hours

async function runResidenceDigest() {
  try {
    const users = await User.find(
      { residence: { $ne: null }, 'notificationPreferences.residenceActivity': { $ne: false } },
      '_id residence lastDigestAt'
    );

    const now = new Date();

    for (const user of users) {
      // First time we've ever digested this user: just establish the
      // baseline timestamp. Notifying them about every listing ever posted
      // in their residence on day one would be spam, not a useful update.
      if (!user.lastDigestAt) {
        await User.updateOne({ _id: user._id }, { lastDigestAt: now });
        continue;
      }

      try {
        const newListingsCount = await Product.countDocuments({
          residence: user.residence,
          seller: { $ne: user._id },
          createdAt: { $gte: user.lastDigestAt },
        });

        if (newListingsCount > 0) {
          await Notification.create({
            user: user._id,
            message: `🔔 ${newListingsCount} new listing${newListingsCount === 1 ? '' : 's'} ${
              newListingsCount === 1 ? 'was' : 'were'
            } posted in ${user.residence}.`,
          });
        }
      } catch (err) {
        console.error(`Failed to build residence digest for user ${user._id}:`, err.message);
      }

      await User.updateOne({ _id: user._id }, { lastDigestAt: now });
    }
  } catch (error) {
    console.error('Error running residence-digest job:', error.message);
  }
}

function startResidenceDigestJob() {
  cron.schedule(DIGEST_INTERVAL_CRON, runResidenceDigest);
  console.log('Residence-activity digest cron job scheduled (runs every 6 hours).');
}

module.exports = { startResidenceDigestJob, runResidenceDigest };