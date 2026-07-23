const cron = require('node-cron');
const Product = require('../models/Product');
const transporter = require('../config/mailer');

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Finds every product that:
//  - is currently "Sold"
//  - was marked Sold at least 24 hours ago
//  - hasn't already had its reminder email sent
// then emails the seller and marks reminderSent so it only fires once.
async function sendSoldReminders() {
  try {
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

    const products = await Product.find({
      status: 'Sold',
      soldAt: { $lte: cutoff },
      reminderSent: false,
    }).populate('seller', 'email firstName');

    for (const product of products) {
      if (!product.seller || !product.seller.email) continue;

      try {
        await transporter.sendMail({
          from: `"HomeMarket" <${process.env.EMAIL_USER}>`,
          to: product.seller.email,
          subject: `Reminder: update the status of "${product.title}"`,
          text:
            `Hi ${product.seller.firstName},\n\n` +
            `Your listing "${product.title}" was marked Sold 24 hours ago after a buyer contacted you.\n\n` +
            `If the sale didn't actually happen, please log in and change the status back to ` +
            `Available or Reserved.\n\n` +
            `If no action is taken, this listing will be automatically removed from HomeMarket ` +
            `in the next 24 hours (48 hours total after being marked Sold).\n\n` +
            `- HomeMarket`,
          html: `
            <p>Hi ${product.seller.firstName},</p>
            <p>Your listing <strong>${product.title}</strong> was marked <strong>Sold</strong> 24 hours ago after a buyer clicked "Contact Seller".</p>
            <p>If the sale didn't actually happen, please log in to your Dashboard and change the status back to <strong>Available</strong> or <strong>Reserved</strong>.</p>
            <p>If no action is taken, this listing will be automatically removed from HomeMarket in the next 24 hours (48 hours total after being marked Sold).</p>
            <p>- HomeMarket</p>
          `,
        });

        product.reminderSent = true;
        await product.save();
      } catch (emailError) {
        console.error(`Failed to send sold-reminder email for product ${product._id}:`, emailError.message);
      }
    }
  } catch (error) {
    console.error('Error running sold-reminder job:', error.message);
  }
}

// Runs at the top of every hour
function startSoldReminderJob() {
  cron.schedule('0 * * * *', sendSoldReminders);
  console.log('Sold-reminder cron job scheduled (runs hourly).');
}

module.exports = { startSoldReminderJob, sendSoldReminders };