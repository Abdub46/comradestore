const Wanted = require('../models/Wanted');
const Notification = require('../models/Notification');

function isBudgetMatch(wanted, product) {
  if (wanted.minBudget != null && product.price < wanted.minBudget) return false;
  if (wanted.maxBudget != null && product.price > wanted.maxBudget) return false;
  return true;
}

function isCategoryOrKeywordMatch(wanted, product) {
  if (wanted.category) return wanted.category === product.category;
  // No category specified - fall back to a simple keyword check against the
  // request's title so we don't just match everything in the residence.
  const keyword = wanted.title.trim().split(/\s+/)[0]?.toLowerCase();
  return Boolean(keyword) && keyword.length >= 3 && product.title.toLowerCase().includes(keyword);
}

// Called fire-and-forget from createProduct, same pattern as
// notifyUsersOfNewListing - never awaited, never allowed to break listing creation.
async function notifyMatchingWantedRequests(product) {
  try {
    const candidates = await Wanted.find({
      status: 'Active',
      residence: product.residence,
      user: { $ne: product.seller },
    }).populate('user', '_id notificationPreferences');

    for (const wanted of candidates) {
      if (!wanted.user) continue;
      if (wanted.user.notificationPreferences?.wantedMatches === false) continue;
      if (!isCategoryOrKeywordMatch(wanted, product)) continue;
      if (!isBudgetMatch(wanted, product)) continue;

      try {
        await Notification.create({
          user: wanted.user._id,
          product: product._id,
          message: `🔔 A new listing matches your wanted request "${wanted.title}": "${product.title}" - KSh ${product.price}`,
        });
      } catch (err) {
        console.error(`Failed to create wanted-match notification for user ${wanted.user._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Failed to run wanted-match notifier:', error.message);
  }
}

module.exports = { notifyMatchingWantedRequests };