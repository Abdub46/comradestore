import React from 'react';
import Skeleton from './Skeleton';

// Mirrors the exact layout of ProductCard. Shown in a grid while product
// data is loading - feels faster and less jarring than a spinner, since
// the person can already see the shape of what's about to fill in.
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-8 w-full mt-1" />
      </div>
    </div>
  );
}