import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LocationIcon } from './icons';
import { formatKsh, timeAgo } from '../utils/format';
import { buildWhatsAppLink } from '../utils/whatsapp';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '../contexts/AuthContext';

export default function ProductRowCard({ product, showPostedTime = false, topLeftBadge = null, oldPrice = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const image = product.images && product.images[0];
  const hasDiscount = Number(product.discount) > 0;
  const isSold = product.status === 'Sold';
  const isReserved = product.status === 'Reserved';
  const sellerPhone = product.seller?.phone;

  return (
    <div className="relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md overflow-hidden">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
          {image ? (
            <img src={image} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}

          {topLeftBadge && !isSold && !isReserved && (
            <span className="absolute top-2 left-2 h-6 px-2 rounded-full bg-black/60 text-white text-[11px] font-semibold flex items-center justify-center shadow-sm">
              {topLeftBadge}
            </span>
          )}

          {hasDiscount && !isSold && !isReserved && (
            <span className="absolute top-2 right-2 h-8 px-2 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
              -{product.discount}%
            </span>
          )}

          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-bold uppercase tracking-wide">Sold</span>
            </div>
          )}

          {isReserved && !isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-bold uppercase tracking-wide bg-orange-600/90 px-3 py-1 rounded-full">
                Reserved
              </span>
            </div>
          )}

          {!isSold && <FavoriteButton product={product} className="absolute bottom-2 right-2" />}
        </div>

        <div className="p-3">
          {oldPrice ? (
            <p className="flex items-baseline gap-2">
              <span className="text-gray-400 line-through text-xs">{formatKsh(oldPrice)}</span>
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
          <p className="text-xs text-gray-400 mt-1">{product.condition}</p>
          {showPostedTime && (
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
              {timeAgo(product.createdAt)}
            </p>
          )}
        </div>
      </Link>

      {isSold && sellerPhone && (
        !user ? (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="block w-full text-center text-xs font-semibold bg-primary-600 text-white py-2 hover:bg-primary-700"
          >
            Contact to Recheck
          </button>
        ) : (
          <a
            href={buildWhatsAppLink(sellerPhone, product.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-xs font-semibold bg-primary-600 text-white py-2 hover:bg-primary-700"
          >
            Contact to Recheck
          </a>
        )
      )}
    </div>
  );
}