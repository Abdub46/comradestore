import React from 'react';
import { Link } from 'react-router-dom';
import { LocationIcon } from './icons';
import { formatKsh } from '../utils/format';
import FavoriteButton from './FavoriteButton';

export default function SavedItemCard({ product }) {
  const image = product.images && product.images[0];
  const hasPriceDrop =
    product.previousPrice != null && Number(product.price) < Number(product.previousPrice) && product.status !== 'Sold';
  const isReserved = product.status === 'Reserved';
  const isSold = product.status === 'Sold';

  return (
    <div className="relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md overflow-hidden">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
          {image ? (
            <img src={image} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}

          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-bold uppercase tracking-wide">Sold</span>
            </div>
          )}
        </div>

        <div className="p-3">
          {hasPriceDrop ? (
            <p className="flex items-baseline gap-2">
              <span className="text-gray-400 line-through text-xs">{formatKsh(product.previousPrice)}</span>
              <span className="text-primary-700 dark:text-primary-300 font-bold">{formatKsh(product.price)}</span>
            </p>
          ) : (
            <p className="text-primary-700 dark:text-primary-300 font-bold">{formatKsh(product.price)}</p>
          )}
          <p className="font-semibold text-sm line-clamp-1 mt-1">{product.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <LocationIcon className="h-3 w-3 flex-shrink-0" />
            {product.residence}
          </p>

          {hasPriceDrop && (
            <p className="text-xs font-semibold text-green-600 mt-2">
              🔥 Price dropped by {formatKsh(product.previousPrice - product.price)}
            </p>
          )}
          {isReserved && <p className="text-xs font-semibold text-orange-600 mt-2">⚠️ This item has been reserved.</p>}
          {isSold && <p className="text-xs font-semibold text-red-600 mt-2">This item has been marked sold.</p>}
        </div>
      </Link>

      <div className="flex items-center justify-between px-3 pb-3">
        <Link
          to={`/product/${product._id}`}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          View & Contact
        </Link>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FavoriteButton product={product} />
          <span>Remove</span>
        </div>
      </div>
    </div>
  );
}