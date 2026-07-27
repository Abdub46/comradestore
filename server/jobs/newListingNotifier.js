const User = require('../models/User');
const transporter = require('../config/mailer');

// Emails every registered user (except the seller who just posted it) that
// a new product is available. Called fire-and-forget from createProduct -
// the seller's request/response is never delayed by this, and a total
// failure here never breaks listing creation itself.
async function notifyUsersOfNewListing(product, sellerId) {
  try {
    const users = await User.find({ _id: { $ne: sellerId } }, 'email firstName');
    if (users.length === 0) return;

    // CLIENT_URL may hold multiple comma-separated origins (see CORS config) -
    // just use the first one as the canonical link in emails.
    const siteUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    const productUrl = `${siteUrl}/product/${product._id}`;

    for (const user of users) {
      try {
        await transporter.sendMail({
          from: `"CampusMarket" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `New Arrival at CampusMarket: ${product.title}`,
          text:
            `Hi ${user.firstName},\n\n` +
            `A new item was just listed on CampusMarket: "${product.title}" (KSh ${product.price}).\n\n` +
            `Check it out here: ${productUrl}\n\n` +
            `- CampusMarket`,
          html: `
            <p>Hi ${user.firstName},</p>
            <p>A new item was just listed on <strong>CampusMarket</strong>:</p>
            <p style="font-size:16px;"><strong>${product.title}</strong> &mdash; KSh ${product.price}</p>
            <p><a href="${productUrl}">Check it out here</a></p>
            <p>- CampusMarket</p>
          `,
        });
      } catch (emailError) {
        // One failed recipient should never stop the rest from being notified
        console.error(`Failed to notify ${user.email} of new listing:`, emailError.message);
      }

      // Small pause between sends to stay well within Gmail's rate limits
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  } catch (error) {
    console.error('Failed to run new-listing notification job:', error.message);
  }
}

module.exports = { notifyUsersOfNewListing };