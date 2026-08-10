const Product = require('../models/Product');
const { stripHtml } = require('../utils/sanitize');
const { convertToWebP } = require('../utils/processImage');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const { notifyUsersOfNewListing } = require('../jobs/newListingNotifier');
const { notifyPriceDrop, notifyStatusChange } = require('../jobs/savedItemNotifier');
const { notifyMatchingWantedRequests } = require('../jobs/wantedMatcher');
const {
  cacheGet,
  cacheSet,
  cacheDel,
  getProductsListVersion,
  bumpProductsListVersion,
  DEFAULT_TTL_SECONDS,
  PRODUCT_TTL_SECONDS,
} = require('../utils/cache');
const { generateContactToken, verifyContactToken } = require('../utils/contactToken');
const logError = require('../utils/logError');

// @desc    Get all products (with search + filters + pagination)
// @route   GET /api/products
// @access  Public
// Query params: search, category, residence, condition, status, minPrice, maxPrice, page, limit, sort
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      residence,
      condition,
      status,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = '-createdAt',
      // Used by Home's "Recently Added" row - e.g. maxAgeDays=2 restricts
      // results to products created within the last 2 days.
      maxAgeDays,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (residence) filter.residence = residence;
    if (condition) filter.condition = condition;
    // Default to only showing Available + Reserved on the public marketplace,
    // unless a specific status is requested (e.g. seller viewing their own Sold items)
    if (status) {
      filter.status = status;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (maxAgeDays) {
      const since = new Date(Date.now() - Number(maxAgeDays) * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: since };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    // Cache-aside: key includes every query param plus the current list
    // "version" (see utils/cache.js), so any write to a product makes this
    // exact key unreachable without having to hunt it down and delete it.
    const version = await getProductsListVersion();
    const cacheKey = `products:list:v${version}:${JSON.stringify(req.query)}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'firstName lastName phone avatar residence createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    const payload = {
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total,
    };

    await cacheSet(cacheKey, payload, DEFAULT_TTL_SECONDS);

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const cacheKey = `product:${req.params.id}`;

    let product = await cacheGet(cacheKey);

    if (!product) {
      product = await Product.findById(req.params.id).populate(
        'seller',
        'firstName lastName phone avatar residence createdAt'
      );

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      await cacheSet(cacheKey, product, PRODUCT_TTL_SECONDS);
    }

    // Fire-and-forget: bumps the real view count in MongoDB without
    // blocking the response or touching the cache. This means the view
    // count shown to visitors can lag behind reality by up to
    // PRODUCT_TTL_SECONDS (5 min) - a fine trade-off since views are a
    // rough popularity signal, not something that needs to be exact.
    Product.updateOne({ _id: req.params.id }, { $inc: { views: 1 } }).catch(() => {});

    // Computed fresh on every request (never cached) - proves to
    // markAsContactedSold that this browser actually loaded this product's
    // detail page recently, rather than blindly looping over IDs.
    const productData = typeof product.toObject === 'function' ? product.toObject() : product;
    const contactToken = generateContactToken(req.params.id);

    res.json({ ...productData, contactToken });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product listing
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, price, condition, residence, discount } = req.body;

    if (!title || !description || !category || !price || !condition || !residence) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Discount is optional - only validate it when the seller actually provided one
    if (discount !== undefined && discount !== '' && (Number(discount) < 0 || Number(discount) > 100)) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }

    // Each uploaded image is converted to WebP (via sharp) before being
    // uploaded to Cloudinary, shrinking file size with no visible quality loss.
    const images = await Promise.all(
      (req.files || []).map(async (file) => {
        const webpBuffer = await convertToWebP(file.buffer);
        return uploadBufferToCloudinary(webpBuffer);
      })
    );

    const product = await Product.create({
      seller: req.user._id,
      title: stripHtml(title),
      description: stripHtml(description),
      category,
      price,
      condition,
      residence,
      images,
      discount: discount !== undefined && discount !== '' ? Number(discount) : 0,
    });

    // New listing changes what every list/filter page should show -
    // invalidate all cached list pages at once.
    await bumpProductsListVersion();

    // Fire-and-forget: notifies all other users by email that a new item
    // was listed. Not awaited, so this never delays the seller's response,
    // and .catch swallows any failure so it can never break listing creation.
    notifyUsersOfNewListing(product, req.user._id).catch(() => {});
    notifyMatchingWantedRequests(product).catch(() => {});

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product listing
// @route   PUT /api/products/:id
// @access  Private (owner only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    // If the seller is actually changing the price, remember the old price
    // first so genuine price drops can be detected later (Pulse "Price
    // Drops" section). Only overwritten on a real change, never guessed.
    let droppedFromPrice = null;
    if (req.body.price !== undefined) {
      const newPrice = Number(req.body.price);
      if (Number.isFinite(newPrice) && newPrice !== product.price) {
        if (newPrice < product.price) droppedFromPrice = product.price;
        product.previousPrice = product.price;
      }
    }

    const fields = ['title', 'description', 'category', 'price', 'condition', 'residence', 'discount'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const value = req.body[field];
        if (field === 'title' || field === 'description') {
          // title/description are free text - strip any HTML/scripts before saving
          product[field] = stripHtml(value);
        } else if (field === 'discount') {
          // Optional - blank input means "no discount", not "leave unchanged"
          product.discount = value === '' ? 0 : Number(value);
        } else {
          product[field] = value;
        }
      }
    });

    // Append any newly uploaded images (up to 5 total), converting each to
    // WebP via sharp before uploading, same as createProduct
    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map(async (file) => {
          const webpBuffer = await convertToWebP(file.buffer);
          return uploadBufferToCloudinary(webpBuffer);
        })
      );
      product.images = [...product.images, ...newImages].slice(0, 5);
    }

    const updated = await product.save();

    await Promise.all([cacheDel(`product:${product._id}`), bumpProductsListVersion()]);

    if (droppedFromPrice !== null) {
      notifyPriceDrop(updated, droppedFromPrice).catch(() => {});
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
// @access  Private (owner only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }

    await product.deleteOne();

    await Promise.all([cacheDel(`product:${product._id}`), bumpProductsListVersion()]);

    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product status (Available / Reserved / Sold)
// @route   PATCH /api/products/:id/status
// @access  Private (owner only)
const updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Available', 'Reserved', 'Sold'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own listings' });
    }

    product.status = status;

    if (status === 'Available') {
      // Fully reset - no reservation clock running
      product.soldAt = null;
      product.contactedAt = null;
      product.reminderSent = false;
      product.reminderSentAt = null;
    } else if (status === 'Reserved') {
      // Manually reserving it (e.g. seller reserves it for someone offline)
      // starts the same 24h-then-24h clock as a buyer contacting them
      product.soldAt = null;
      product.contactedAt = new Date();
      product.reminderSent = false;
      product.reminderSentAt = null;
    } else if (status === 'Sold') {
      // Start the 2-day auto-delete timer; reservation clock no longer applies
      product.soldAt = new Date();
      product.contactedAt = null;
      product.reminderSent = false;
      product.reminderSentAt = null;
    }

    await product.save();

    await Promise.all([cacheDel(`product:${product._id}`), bumpProductsListVersion()]);

    if (status === 'Reserved' || status === 'Sold') {
      notifyStatusChange(product, status).catch(() => {});
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Flip a product to Reserved as soon as a buyer clicks "Contact Seller".
//          Starts a 24h-then-24h clock: reminder email+notification at 24h if
//          still Reserved, then auto-flips to Sold at 48h if still no action
//          from the seller (which then auto-deletes 2 days later via the
//          soldAt TTL index below).
// @route   PATCH /api/products/:id/contact
// @access  Public (protected by the short-lived contact token, not login)
const markAsContactedSold = async (req, res, next) => {
  try {
    if (!verifyContactToken(req.params.id, req.body.contactToken)) {
      logError({
        source: 'server',
        severity: 'security',
        message: `Invalid/expired contact token used on product ${req.params.id} - possible ID enumeration attempt`,
        path: req.originalUrl,
        statusCode: 403,
      });
      return res.status(403).json({ message: 'This link has expired - please refresh the product page and try again.' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Every verified contact-token use is a genuine "Contact Seller" click,
    // whether or not it's the first (which also flips status below).
    Product.updateOne({ _id: product._id }, { $inc: { contactsCount: 1 } }).catch(() => {});

    // Only start the clock the first time a product is contacted. If it's
    // already Reserved (an earlier buyer already contacted the seller) or
    // already Sold, don't reset the timers - just let this buyer's WhatsApp
    // message go through as normal without touching the product record.
    if (product.status === 'Available') {
      product.status = 'Reserved';
      product.contactedAt = new Date();
      product.reminderSent = false;
      product.reminderSentAt = null;
      await product.save();

      await Promise.all([cacheDel(`product:${product._id}`), bumpProductsListVersion()]);

      notifyStatusChange(product, 'Reserved').catch(() => {});
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's own listings
// @route   GET /api/products/my-listings
// @access  Private
const getMyListings = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort('-createdAt');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite on a product
// @route   PATCH /api/products/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const userId = req.user._id.toString();
    const alreadyFavorited = product.favoritedBy.some((id) => id.toString() === userId);

    if (alreadyFavorited) {
      product.favoritedBy = product.favoritedBy.filter((id) => id.toString() !== userId);
    } else {
      product.favoritedBy.push(req.user._id);
    }

    await product.save();

    await cacheDel(`product:${product._id}`);

    res.json({ favorited: !alreadyFavorited });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the logged-in user's saved/favorited products
// @route   GET /api/products/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const products = await Product.find({ favoritedBy: req.user._id })
      .populate('seller', 'firstName lastName phone avatar residence')
      .sort('-updatedAt');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  markAsContactedSold,
  getMyListings,
  toggleFavorite,
  getFavorites,
};