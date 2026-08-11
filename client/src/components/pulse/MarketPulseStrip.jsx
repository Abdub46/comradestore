import React from 'react';
import Skeleton from '../Skeleton';

export default function MarketPulseStrip({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { newListingsToday = 0, priceDropsToday = 0, trendingCount = 0 } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Market Pulse
        </h3>
        <div className="flex flex-col items-start gap-2 text-sm md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2">
          <span>
            <strong className="text-primary-700 dark:text-primary-300">{newListingsToday}</strong> New listing
            {newListingsToday === 1 ? '' : 's'} today
          </span>
          <span>
            <strong className="text-primary-700 dark:text-primary-300">{priceDropsToday}</strong> Price drop
            {priceDropsToday === 1 ? '' : 's'} today
          </span>
          <span>
            <strong className="text-primary-700 dark:text-primary-300">{trendingCount}</strong> Trending listing
            {trendingCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </div>
  );
}