const Product = require('../models/Product');
const { stripHtml } = require('../utils/sanitize');
const { convertToWebP } = require('../utils/processImage');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const { notifyUsersOfNewListing } = require('../jobs/newListingNotifier');
const {
  cacheGet,
  cacheSet,
  cacheDel,
  getProductsListVersion,
  bumpProductsListVersion,
  DEFAULT_TTL_SECONDS,
  PRODUCT_TTL_SECONDS,
} = require('../utils/cache');

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
      maxAgeDays,
      page = 1,
      limit = 12,
      sort = '-createdAt',
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

    Product.updateOne({ _id: req.params.id }, { $inc: { views: 1 } }).catch(() => {});

    res.json(product);
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
  discount:
    discount !== undefined && discount !== ''
      ? Number(discount)
      : 0,
  images,
});

await bumpProductsListVersion();

    // Fire-and-forget: notifies all other users by email that a new item
    // was listed. Not awaited, so this never delays the seller's response,
    // and .catch swallows any failure so it can never break listing creation.
    notifyUsersOfNewListing(product, req.user._id).catch(() => {});

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

    const fields = ['title', 'description', 'category', 'price', 'condition', 'residence', 'discount' ];
    fields.forEach((field) => {
  if (req.body[field] !== undefined) {
    let value = req.body[field];

    if (field === 'discount') {
      value = value === '' ? 0 : Number(value);
    }

    // title/description are free text - strip any HTML/scripts before saving
    product[field] =
      field === 'title' || field === 'description'
        ? stripHtml(value)
        : value;
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
    // Start (or clear) the 2-day auto-delete timer based on the new status
    product.soldAt = status === 'Sold' ? new Date() : null;
    // Reset the reminder flag so a fresh Sold cycle gets its own 24-hour reminder
   product.reminderSent = false;
    await product.save();

    await Promise.all([cacheDel(`product:${product._id}`), bumpProductsListVersion()]);

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a product as Sold as soon as a buyer clicks "Contact Seller"
//          Stays Sold until the seller manually toggles it back in their Dashboard
// @route   PATCH /api/products/:id/contact
// @access  Public
const markAsContactedSold = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'Sold';
    // Start the 2-day auto-delete timer
    product.soldAt = new Date();
    // Reset the reminder flag so this fresh Sold cycle gets its own 24-hour reminder
    product.reminderSent = false;
    await product.save();

    await Promise.all([cacheDel(`product:${product._id}`), bumpProductsListVersion()]);

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
};