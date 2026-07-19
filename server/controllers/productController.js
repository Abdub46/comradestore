const Product = require('../models/Product');

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

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'firstName lastName phone avatar residence createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'firstName lastName phone avatar residence createdAt');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

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
    const { title, description, category, price, condition, residence } = req.body;

    if (!title || !description || !category || !price || !condition || !residence) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const images = (req.files || []).map((file) => file.path);

    const product = await Product.create({
      seller: req.user._id,
      title,
      description,
      category,
      price,
      condition,
      residence,
      images,
    });

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

    const fields = ['title', 'description', 'category', 'price', 'condition', 'residence'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    // Append any newly uploaded images (up to 5 total)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      product.images = [...product.images, ...newImages].slice(0, 5);
    }

    const updated = await product.save();
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
    await product.save();
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
    await product.save();
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
