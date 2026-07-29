import React from 'react';
import { Link } from 'react-router-dom';
import { LocationIcon, ClockIcon } from './icons';
import { formatKsh, timeAgo } from '../utils/format';


export default function ProductRowCard({ product }) {
  const image = product.images && product.images[0];
  const hasDiscount = Number(product.discount) > 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="relative flex-shrink-0 w-44 sm:w-48 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md overflow-hidden snap-start"
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
        {image ? (
          <img src={image} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
  
     {hasDiscount && (
  <span className="absolute top-2 right-2 h-8 px-2 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
    -{product.discount}%
  </span>
)}
      </div>

      <div className="p-3">
  <p className="text-primary-700 dark:text-primary-300 font-bold">
    {formatKsh(product.price)}
  </p>

  <p className="font-semibold text-sm line-clamp-1 mt-1">
    {product.title}
  </p>

  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
    <LocationIcon className="h-3 w-3 flex-shrink-0" />
    {product.residence}
  </p>

  <p className="text-xs text-gray-500 mt-1">
    {product.condition}
  </p>

  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
    <ClockIcon className="h-3 w-3 flex-shrink-0" />
    {timeAgo(product.createdAt)}
  </p>
</div>


    </Link>
  );
}