import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatKsh } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import FavoriteButton from './FavoriteButton';

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-orange-100 text-orange-700',
  Sold: 'bg-red-100 text-red-700',
};

// Wrapped in memo() since this renders many times in a grid (8-20+ per
// page). Combined with the useCallback on addToCart in CartContext, adding
// ONE item to the cart no longer re-renders every other card in the grid -
// only the one that actually changed.
//
// Animations use only opacity/transform (never width/height/margin), which
// the browser can run on the GPU without triggering layout recalculation -
// smooth even with many cards animating in a grid at once.
function ProductCard({ product, onAddToCart, inCart }) {
  const { user } = useAuth();
  const image = product.images && product.images[0];
  const isSold = product.status === 'Sold';
  const isOwner = Boolean(user && product.seller && user._id === product.seller._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md overflow-hidden flex flex-col"
    >
      <Link to={`/product/${product._id}`} className="block relative aspect-square bg-gray-100 dark:bg-gray-700">
        {image ? (
          <img src={image} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        <span
          className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[product.status]}`}
        >
          {product.status}
        </span>
        <FavoriteButton product={product} className="absolute top-2 right-2" />
      </Link>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link to={`/product/${product._id}`} className="font-semibold text-sm line-clamp-1 hover:text-primary-600">
          {product.title}
        </Link>
        <p className="text-primary-700 dark:text-primary-300 font-bold">{formatKsh(product.price)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {product.condition} &middot; {product.residence}
        </p>

        {isOwner ? (
          <button
            disabled
            className="mt-2 w-full text-sm py-1.5 rounded-md bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
          >
            Your Listing
          </button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onAddToCart && onAddToCart(product)}
            disabled={isSold || inCart}
            className="mt-2 w-full text-sm py-1.5 rounded-md bg-primary-600 text-white disabled:bg-gray-300 disabled:text-gray-500 hover:bg-primary-700 disabled:cursor-not-allowed"
          >
            {isSold ? 'Sold Out' : inCart ? 'In Cart' : 'Add to Cart'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default memo(ProductCard);