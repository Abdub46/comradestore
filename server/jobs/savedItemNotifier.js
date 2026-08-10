const User = require('../models/User');
const Notification = require('../models/Notification');

// Shared by notifyPriceDrop/notifyStatusChange below - looks up which of
// this product's favoriters actually want this type of notification, then
// creates one Notification doc per recipient. Fire-and-forget: callers
// never await this, matching notifyUsersOfNewListing's existing pattern.
async function notifyFavoriters(product, prefKey, message) {
  if (!product.favoritedBy || product.favoritedBy.length === 0) return;

  try {
    const recipients = await User.find(
      {
        _id: { $in: product.favoritedBy, $ne: product.seller },
        [`notificationPreferences.${prefKey}`]: { $ne: false },
      },
      '_id'
    );

    await Promise.all(
      recipients.map((user) =>
        Notification.create({ user: user._id, product: product._id, message }).catch((err) => {
          console.error(`Failed to create ${prefKey} notification for user ${user._id}:`, err.message);
        })
      )
    );
  } catch (error) {
    console.error(`Failed to notify favoriters (${prefKey}) of product ${product._id}:`, error.message);
  }
}

// Called from updateProduct right after a genuine price decrease is saved.
async function notifyPriceDrop(product, oldPrice) {
  const message = `🔥 A saved item dropped from KSh ${oldPrice} to KSh ${product.price}: "${product.title}"`;
  await notifyFavoriters(product, 'priceDrops', message);
}

// Called whenever a saved product's status actually changes to Reserved or Sold.
async function notifyStatusChange(product, status) {
  const message =
    status === 'Sold'
      ? `A saved item has been marked sold: "${product.title}"`
      : `⚠️ A saved item has been reserved: "${product.title}"`;
  await notifyFavoriters(product, 'savedItemStatus', message);
}

module.exports = { notifyPriceDrop, notifyStatusChange };