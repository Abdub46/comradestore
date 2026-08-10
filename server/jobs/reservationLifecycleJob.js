const cron = require('node-cron');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const transporter = require('../config/mailer');
const { notifyStatusChange } = require('./savedItemNotifier');

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Stage 1: any product that's been Reserved for 24+ hours and hasn't had
// its reminder sent yet gets an email + in-app notification asking the
// seller to confirm the sale or toggle it back to Available.
async function sendReservationReminders() {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

  const products = await Product.find({
    status: 'Reserved',
    contactedAt: { $lte: cutoff },
    reminderSent: false,
  }).populate('seller', 'email firstName');

  for (const product of products) {
    if (!product.seller) continue;

    const message = `Did the sale for "${product.title}" go through? If not, open your Dashboard and set it back to Available.`;

    try {
      await Notification.create({
        user: product.seller._id,
        product: product._id,
        message,
      });
    } catch (notifyError) {
      console.error(`Failed to create in-app notification for product ${product._id}:`, notifyError.message);
    }

    if (product.seller.email) {
      try {
        await transporter.sendMail({
          from: `"ComradeMarket" <${process.env.EMAIL_USER}>`,
          to: product.seller.email,
          subject: `Did your sale go through? - "${product.title}"`,
          text:
            `Hi ${product.seller.firstName},\n\n` +
            `A buyer contacted you about "${product.title}" 24 hours ago, so we've marked it Reserved.\n\n` +
            `Did the sale go through? If not, please log in and set the status back to Available so other buyers can see it.\n\n` +
            `If we don't hear anything, this listing will automatically be marked Sold in the next 24 hours, ` +
            `and then removed from ComradeMarket 2 days after that.\n\n` +
            `- ComradeMarket`,
          html: `
            <p>Hi ${product.seller.firstName},</p>
            <p>A buyer contacted you about <strong>${product.title}</strong> 24 hours ago, so we've marked it <strong>Reserved</strong>.</p>
            <p>Did the sale go through? If not, please log in to your Dashboard and set the status back to <strong>Available</strong> so other buyers can see it.</p>
            <p>If we don't hear anything, this listing will automatically be marked <strong>Sold</strong> in the next 24 hours, and then removed from ComradeMarket 2 days after that.</p>
            <p>- ComradeMarket</p>
          `,
        });
      } catch (emailError) {
        console.error(`Failed to send reservation reminder email for product ${product._id}:`, emailError.message);
      }
    }

    product.reminderSent = true;
    product.reminderSentAt = new Date();
    await product.save();
  }
}

// Stage 2: any product still Reserved 24+ hours after its reminder was sent
// (48h total since contact) with no action from the seller gets auto-flipped
// to Sold. That starts the existing soldAt TTL index, which auto-deletes the
// listing 2 days later - no extra code needed for that final step.
async function autoFlipStaleReservationsToSold() {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

  const products = await Product.find({
    status: 'Reserved',
    reminderSent: true,
    reminderSentAt: { $lte: cutoff },
  }).populate('seller', 'email firstName');

  for (const product of products) {
    product.status = 'Sold';
    product.soldAt = new Date();
    product.contactedAt = null;
    product.reminderSent = false;
    product.reminderSentAt = null;
    await product.save();

    notifyStatusChange(product, 'Sold').catch(() => {});

    if (product.seller) {
      try {
        await Notification.create({
          user: product.seller._id,
          product: product._id,
          message: `"${product.title}" was automatically marked Sold since we didn't hear back from you. It'll be removed from the site in 2 days if this isn't corrected.`,
        });
      } catch (notifyError) {
        console.error(`Failed to create auto-sold notification for product ${product._id}:`, notifyError.message);
      }
    }
  }
}

async function runReservationLifecycleCheck() {
  try {
    await sendReservationReminders();
    await autoFlipStaleReservationsToSold();
  } catch (error) {
    console.error('Error running reservation-lifecycle job:', error.message);
  }
}

// Runs at the top of every hour
function startReservationLifecycleJob() {
  cron.schedule('0 * * * *', runReservationLifecycleCheck);
  console.log('Reservation-lifecycle cron job scheduled (runs hourly).');
}

module.exports = { startReservationLifecycleJob, runReservationLifecycleCheck };