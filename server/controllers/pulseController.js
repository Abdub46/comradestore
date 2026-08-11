const Product = require('../models/Product');
const User = require('../models/User');
const Wanted = require('../models/Wanted');

const RESIDENCES = ['Sokomoko', 'KU', 'Annex'];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// A product only counts as a genuine price drop if it has a previousPrice
// on record (set by updateProduct only when a seller actually edits the
// price - see models/Product.js) and the new price is actually lower.
const PRICE_DROP_FILTER = {
  status: 'Available',
  previousPrice: { $ne: null },
  $expr: { $lt: ['$price', '$previousPrice'] },
};

const PUBLIC_PRODUCT_FIELDS =
  'title price previousPrice discount images residence condition status views favoritedBy createdAt updatedAt seller';

// @desc    Aggregated data for the ComradeMarket Pulse homepage
// @route   GET /api/pulse?since=<ISO date>&residence=<Sokomoko|KU|Annex>
// @access  Public (optionalAuth - personalizes for logged-in users)
//
// `since` and `residence` are only used for guests (no account to persist
// state on). For logged-in users we use the real lastSeenAt/residence
// already stored on their account and ignore the query params, so a guest
// can't spoof another user's state simply by passing query params while
// logged in.
const getPulse = async (req, res, next) => {
  try {
    const isAuthed = Boolean(req.user);
    const residence = isAuthed
      ? req.user.residence
      : RESIDENCES.includes(req.query.residence) ? req.query.residence : null;

    // ---- Since You Last Visited ----
    let previousVisit = null;
    if (isAuthed) {
      previousVisit = req.user.lastSeenAt || null;
      // Fire-and-forget: record this visit as "now" for next time. Not
      // awaited so it never slows down the homepage response.
      User.updateOne({ _id: req.user._id }, { lastSeenAt: new Date() }).catch(() => {});
    } else if (req.query.since) {
      const parsed = new Date(req.query.since);
      if (!Number.isNaN(parsed.getTime())) previousVisit = parsed;
    }

    let sinceLastVisit;
    if (!previousVisit) {
      sinceLastVisit = { isFirstVisit: true };
    } else {
      const sinceFilter = { createdAt: { $gte: previousVisit } };
      const [newListings, priceDrops, nearbyNew] = await Promise.all([
        Product.countDocuments(sinceFilter),
        Product.countDocuments({ ...PRICE_DROP_FILTER, updatedAt: { $gte: previousVisit } }),
        residence
          ? Product.countDocuments({ ...sinceFilter, residence })
          : Promise.resolve(null),
      ]);
      sinceLastVisit = {
        isFirstVisit: false,
        newListings,
        priceDrops,
        nearbyNew,
      };
    }

    // ---- Just Listed ----
    // Must genuinely be recent, not just "the 8 newest of whatever exists" -
    // otherwise a quiet marketplace would relabel week(s)-old listings as
    // "Just Listed" simply because nothing newer was posted since.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const justListedPromise = Product.find({
      status: { $ne: 'Sold' },
      createdAt: { $gte: sevenDaysAgo },
    })
      .select(PUBLIC_PRODUCT_FIELDS)
      .populate('seller', 'firstName lastName phone avatar residence')
      .sort('-createdAt')
      .limit(8);

    // ---- Trending count (Market Pulse strip only) ----
    // No per-view-event log exists in this app (Product.views is a lifetime
    // counter bumped on every product-detail load), so "recent" activity is
    // approximated using updatedAt (which Mongoose bumps automatically on
    // every view-count increment and every favorite toggle, since the
    // schema has {timestamps:true}). Trending = real engagement (views +
    // favorites), restricted to listings that have had that engagement
    // recently, not just ever. This is just a count for the Market Pulse
    // strip - uncapped, so it reflects the real number rather than a
    // display-limited one.
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const trendingCountPromise = Product.countDocuments({
      status: 'Available',
      updatedAt: { $gte: fourteenDaysAgo },
      $or: [{ views: { $gt: 0 } }, { $expr: { $gt: [{ $size: '$favoritedBy' }, 0] } }],
    });

    // ---- Featured Items ----
    // Every listing, ordered by trending score (views + weighted favorites).
    // No status/recency filter here: Reserved and Sold items are included
    // (with a badge shown client-side) and stay listed right up until the
    // moment they're actually removed - which for Sold items happens
    // automatically via the soldAt TTL index on the Product model (2 days
    // after being marked Sold), so nothing further to exclude here.
    const featuredPromise = Product.aggregate([
      {
        $addFields: {
          favoritesCount: { $size: '$favoritedBy' },
          trendingScore: { $add: ['$views', { $multiply: [{ $size: '$favoritedBy' }, 5] }] },
        },
      },
      { $sort: { trendingScore: -1, updatedAt: -1 } },
    ]);

    // ---- People Are Looking For (Wanted Board) ----
    const wantedPromise = Wanted.find({ status: 'Active' })
      .populate('user', 'firstName lastName phone avatar residence')
      .sort('-createdAt')
      .limit(6);

    // ---- Market Pulse (site-wide, today) ----
    const today = startOfToday();
    const marketPulsePromise = Promise.all([
      Product.countDocuments({ createdAt: { $gte: today } }),
      Product.countDocuments({ ...PRICE_DROP_FILTER, updatedAt: { $gte: today } }),
    ]);

    const [justListed, featured, wanted, trendingCount, [newListingsToday, priceDropsToday]] =
      await Promise.all([
        justListedPromise,
        featuredPromise,
        wantedPromise,
        trendingCountPromise,
        marketPulsePromise,
      ]);

    // seller/populate + views field need to load for featured's raw
    // aggregate results too (aggregate() skips populate/select).
    const featuredIds = featured.map((p) => p._id);
    const featuredDocs = await Product.find({ _id: { $in: featuredIds } })
      .select(PUBLIC_PRODUCT_FIELDS)
      .populate('seller', 'firstName lastName phone avatar residence');
    const featuredById = new Map(featuredDocs.map((p) => [p._id.toString(), p]));
    const featuredWithProducts = featured
      .map((t) => {
        const product = featuredById.get(t._id.toString());
        return product ? { product: product.toObject(), trendingScore: t.trendingScore } : null;
      })
      .filter(Boolean);

    res.json({
      sinceLastVisit,
      residence,
      justListed,
      featured: featuredWithProducts,
      wanted,
      marketPulse: {
        newListingsToday,
        priceDropsToday,
        trendingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPulse };