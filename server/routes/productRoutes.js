const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  markAsContactedSold,
  getMyListings,
  toggleFavorite,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { contactLimiter } = require('../middleware/security');

// Order matters: /my-listings must be registered before /:id
router.get('/my-listings', protect, getMyListings);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, upload.array('images', 5), createProduct);
router.put('/:id', protect, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/:id/status', protect, updateProductStatus);
router.patch('/:id/contact', contactLimiter, markAsContactedSold);
router.patch('/:id/favorite', protect, toggleFavorite);

module.exports = router;
