import React from 'react';
import Skeleton from '../Skeleton';

function StatPill({ value, label }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-center shadow-sm min-w-[100px]">
      <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export default function WelcomeBack({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  if (data.isFirstVisit) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-primary-50 dark:bg-gray-800 rounded-xl px-5 py-4">
          <h2 className="text-lg font-semibold">Welcome to ComradeMarket 👋</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Browse what's on the market right now, or list something of your own.
          </p>
        </div>
      </div>
    );
  }

  const { newListings = 0, priceDrops = 0, nearbyNew } = data;
  const hasNearby = typeof nearbyNew === 'number';
  const nothingChanged = newListings === 0 && priceDrops === 0 && (!hasNearby || nearbyNew === 0);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">
      <div className="bg-primary-50 dark:bg-gray-800 rounded-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Welcome back 👋</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
          {nothingChanged ? "Quiet since you were last here - check back soon." : "Here's what changed while you were away."}
        </p>

        {!nothingChanged && (
          <div className="flex flex-wrap gap-3">
            {newListings > 0 && <StatPill value={newListings} label={newListings === 1 ? 'New Listing' : 'New Listings'} />}
            {priceDrops > 0 && <StatPill value={priceDrops} label={priceDrops === 1 ? 'Price Drop' : 'Price Drops'} />}
            {hasNearby && nearbyNew > 0 && <StatPill value={nearbyNew} label="Near You" />}
          </div>
        )}
      </div>
    </div>
  );
}