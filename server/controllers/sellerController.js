const Product = require('../models/Product');
const Wanted = require('../models/Wanted');

const RECENT_ACTIVITY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const STALE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function computeHealth(product) {
  const missing = [];
  if (!product.images || product.images.length === 0) missing.push('At least one photo');
  if (!product.description || product.description.trim().length < 20) missing.push('A more detailed description');
  if (!product.price) missing.push('A price');
  if (!product.residence) missing.push('A residence');
  if (!product.category) missing.push('A category');

  return {
    hasPhotos: Boolean(product.images && product.images.length > 0),
    photoCount: product.images ? product.images.length : 0,
    descriptionComplete: Boolean(product.description && product.description.trim().length >= 20),
    hasPrice: Boolean(product.price),
    hasResidence: Boolean(product.residence),
    hasCategory: Boolean(product.category),
    hasContactMethod: true, // phone is required at registration, always present
    missing,
  };
}

function computePerformance(product) {
  if (product.status !== 'Available') return { label: null, suggestion: null };

  const now = Date.now();
  const updatedRecently = now - new Date(product.updatedAt).getTime() < RECENT_ACTIVITY_WINDOW_MS;
  const hasEngagement = product.views > 0 || (product.favoritedBy && product.favoritedBy.length > 0);
  const ageMs = now - new Date(product.createdAt).getTime();

  if (updatedRecently && hasEngagement) {
    return { label: 'trending', suggestion: null };
  }

  // "Slowing" only makes sense once a listing has been up a while without
  // any recent engagement bump - a brand-new listing isn't "slowing down".
  if (!updatedRecently && ageMs > STALE_WINDOW_MS) {
    return { label: 'slowing', suggestion: 'Consider reviewing your price.' };
  }

  return { label: null, suggestion: null };
}

// @desc    Aggregated seller-intelligence data: overview, per-listing
//          performance/health, and demand from the Wanted Board.
// @route   GET /api/seller/intelligence
// @access  Private
const getSellerIntelligence = async (req, res, next) => {
  try {
    const listings = await Product.find({ seller: req.user._id }).sort('-createdAt');

    const overview = listings.reduce(
      (acc, p) => {
        acc.views += p.views || 0;
        acc.saves += p.favoritedBy ? p.favoritedBy.length : 0;
        acc.contacts += p.contactsCount || 0;
        if (p.status !== 'Sold') acc.activeListings += 1;
        return acc;
      },
      { views: 0, saves: 0, contacts: 0, activeListings: 0 }
    );

    const listingsWithIntel = listings.map((p) => {
      const performance = computePerformance(p);
      return {
        _id: p._id,
        title: p.title,
        price: p.price,
        status: p.status,
        images: p.images,
        category: p.category,
        createdAt: p.createdAt,
        views: p.views,
        savesCount: p.favoritedBy ? p.favoritedBy.length : 0,
        contactsCount: p.contactsCount || 0,
        performance: performance.label,
        suggestion: performance.suggestion,
        health: computeHealth(p),
      };
    });

    // ---- Demand intelligence: active Wanted requests in categories this
    // seller actually sells, so it's relevant instead of generic. ----
    const sellerCategories = [...new Set(listings.map((p) => p.category))];
    let demand = [];
    if (sellerCategories.length > 0) {
      const matchingRequests = await Wanted.find({
        status: 'Active',
        category: { $in: sellerCategories },
      });

      const byCategory = new Map();
      for (const w of matchingRequests) {
        if (!byCategory.has(w.category)) byCategory.set(w.category, { count: 0, maxBudgets: [] });
        const entry = byCategory.get(w.category);
        entry.count += 1;
        if (w.maxBudget != null) entry.maxBudgets.push(w.maxBudget);
      }

      demand = [...byCategory.entries()].map(([category, entry]) => ({
        category,
        count: entry.count,
        // Highest budget cap among matching requests, if any specified one -
        // real data only, never a fabricated "typical" figure.
        maxBudgetCap: entry.maxBudgets.length > 0 ? Math.max(...entry.maxBudgets) : null,
      }));
    }

    res.json({ overview, listings: listingsWithIntel, demand });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSellerIntelligence };