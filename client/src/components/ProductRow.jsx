import React from 'react';
import { Link } from 'react-router-dom';
import Skeleton from './Skeleton';
import ProductRowCard from './ProductRowCard';

function RowCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 sm:w-48 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export default function ProductRow({ title, products, isLoading }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link to="/search" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View all
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <RowCardSkeleton key={i} />)
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-sm">No listings yet.</p>
        ) : (
          products.map((product) => <ProductRowCard key={product._id} product={product} />)
        )}
      </div>
    </div>
  );
}