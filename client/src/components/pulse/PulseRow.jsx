import React from 'react';
import Skeleton from '../Skeleton';

function RowCardSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export default function PulseRow({ title, subtitle, items, isLoading, emptyMessage, renderCard }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <RowCardSkeleton key={i} />)
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full">{emptyMessage}</p>
        ) : (
          items.map(renderCard)
        )}
      </div>
    </div>
  );
}