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

    // ---- Trending Now ----
    // No per-view-event log exists in this app (Product.views is a lifetime
    // counter bumped on every product-detail load), so "recent" activity is
    // approximated using updatedAt (which Mongoose bumps automatically on
    // every view-count increment and every favorite toggle, since the
    // schema has {timestamps:true}). Trending = real engagement (views +
    // favorites), restricted to listings that have had that engagement
    // recently, not just ever.
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const trendingPromise = Product.aggregate([
      {
        $match: {
          status: 'Available',
          updatedAt: { $gte: fourteenDaysAgo },
          $or: [{ views: { $gt: 0 } }, { $expr: { $gt: [{ $size: '$favoritedBy' }, 0] } }],
        },
      },
      {
        $addFields: {
          favoritesCount: { $size: '$favoritedBy' },
          trendingScore: { $add: ['$views', { $multiply: [{ $size: '$favoritedBy' }, 5] }] },
        },
      },
      { $sort: { trendingScore: -1, updatedAt: -1 } },
      { $limit: 8 },
    ]);

    // ---- Price Drops ----
    const priceDropsPromise = Product.find(PRICE_DROP_FILTER)
      .select(PUBLIC_PRODUCT_FIELDS)
      .populate('seller', 'firstName lastName phone avatar residence')
      .sort('-updatedAt')
      .limit(8);

    // ---- Around You ----
    const aroundYouPromise = residence
      ? Product.find({ residence, status: { $ne: 'Sold' } })
          .select(PUBLIC_PRODUCT_FIELDS)
          .populate('seller', 'firstName lastName phone avatar residence')
          .sort('-createdAt')
          .limit(8)
      : Promise.resolve([]);

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

    const [justListed, trending, priceDrops, aroundYou, wanted, [newListingsToday, priceDropsToday]] =
      await Promise.all([
        justListedPromise,
        trendingPromise,
        priceDropsPromise,
        aroundYouPromise,
        wantedPromise,
        marketPulsePromise,
      ]);

    // seller/populate + views field need to load for trending's raw
    // aggregate results too (aggregate() skips populate/select).
    const trendingIds = trending.map((p) => p._id);
    const trendingDocs = await Product.find({ _id: { $in: trendingIds } })
      .select(PUBLIC_PRODUCT_FIELDS)
      .populate('seller', 'firstName lastName phone avatar residence');
    const trendingById = new Map(trendingDocs.map((p) => [p._id.toString(), p]));
    const trendingWithProducts = trending
      .map((t) => {
        const product = trendingById.get(t._id.toString());
        return product ? { product: product.toObject(), trendingScore: t.trendingScore } : null;
      })
      .filter(Boolean);

    res.json({
      sinceLastVisit,
      residence,
      justListed,
      trending: trendingWithProducts,
      priceDrops,
      aroundYou,
      wanted,
      marketPulse: {
        newListingsToday,
        priceDropsToday,
        trendingCount: trendingWithProducts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPulse };