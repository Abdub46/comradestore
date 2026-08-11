const cron = require('node-cron');
const Wanted = require('../models/Wanted');
const Notification = require('../models/Notification');
const transporter = require('../config/mailer');

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Stage 1: any wanted request that's been Reserved for 24+ hours and hasn't
// had its reminder sent yet gets an email + in-app notification asking the
// buyer whether the deal with the seller who contacted them went through.
async function sendWantedReminders() {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

  const requests = await Wanted.find({
    status: 'Reserved',
    contactedAt: { $lte: cutoff },
    reminderSent: false,
  }).populate('user', 'email firstName');

  for (const wanted of requests) {
    if (!wanted.user) continue;

    const message = `Did you get "${wanted.title}" from the seller who contacted you? If not, open the Wanted Board and set it back to Active.`;

    try {
      await Notification.create({
        user: wanted.user._id,
        message,
      });
    } catch (notifyError) {
      console.error(`Failed to create in-app notification for wanted request ${wanted._id}:`, notifyError.message);
    }

    if (wanted.user.email) {
      try {
        await transporter.sendMail({
          from: `"ComradeMarket" <${process.env.EMAIL_USER}>`,
          to: wanted.user.email,
          subject: `Did you get what you were looking for? - "${wanted.title}"`,
          text:
            `Hi ${wanted.user.firstName},\n\n` +
            `A seller contacted you about your "${wanted.title}" request 24 hours ago, so we've marked it Reserved.\n\n` +
            `Did you get it? If not, please log in and set the status back to Active so other sellers can see it.\n\n` +
            `If we don't hear anything, this request will automatically be marked Fulfilled in the next 24 hours, ` +
            `and then removed from ComradeMarket 2 days after that.\n\n` +
            `- ComradeMarket`,
          html: `
            <p>Hi ${wanted.user.firstName},</p>
            <p>A seller contacted you about your <strong>${wanted.title}</strong> request 24 hours ago, so we've marked it <strong>Reserved</strong>.</p>
            <p>Did you get it? If not, please log in to the Wanted Board and set the status back to <strong>Active</strong> so other sellers can see it.</p>
            <p>If we don't hear anything, this request will automatically be marked <strong>Fulfilled</strong> in the next 24 hours, and then removed from ComradeMarket 2 days after that.</p>
            <p>- ComradeMarket</p>
          `,
        });
      } catch (emailError) {
        console.error(`Failed to send wanted reminder email for request ${wanted._id}:`, emailError.message);
      }
    }

    wanted.reminderSent = true;
    wanted.reminderSentAt = new Date();
    await wanted.save();
  }
}

// Stage 2: any request still Reserved 24+ hours after its reminder was sent
// (48h total since contact) with no action from the buyer gets auto-flipped
// to Fulfilled. That starts the existing fulfilledAt TTL index, which
// auto-deletes the request 2 days later - no extra code needed for that
// final step.
async function autoFlipStaleWantedToFulfilled() {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

  const requests = await Wanted.find({
    status: 'Reserved',
    reminderSent: true,
    reminderSentAt: { $lte: cutoff },
  }).populate('user', 'email firstName');

  for (const wanted of requests) {
    wanted.status = 'Fulfilled';
    wanted.fulfilledAt = new Date();
    wanted.contactedAt = null;
    wanted.reminderSent = false;
    wanted.reminderSentAt = null;
    await wanted.save();

    if (wanted.user) {
      try {
        await Notification.create({
          user: wanted.user._id,
          message: `"${wanted.title}" was automatically marked Fulfilled since we didn't hear back from you. It'll be removed from the site in 2 days if this isn't correct.`,
        });
      } catch (notifyError) {
        console.error(`Failed to create auto-fulfilled notification for wanted request ${wanted._id}:`, notifyError.message);
      }
    }
  }
}

async function runWantedLifecycleCheck() {
  try {
    await sendWantedReminders();
    await autoFlipStaleWantedToFulfilled();
  } catch (error) {
    console.error('Error running wanted-lifecycle job:', error.message);
  }
}

// Runs at the top of every hour
function startWantedLifecycleJob() {
  cron.schedule('0 * * * *', runWantedLifecycleCheck);
  console.log('Wanted-lifecycle cron job scheduled (runs hourly).');
}

module.exports = { startWantedLifecycleJob, runWantedLifecycleCheck };