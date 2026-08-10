import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../services/productService';
import SavedItemCard from '../components/SavedItemCard';
import Skeleton from '../components/Skeleton';

function SummaryPill({ value, label }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-center shadow-sm min-w-[90px]">
      <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function CardSkeleton() {
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

export default function SavedItems() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });

  const items = products || [];
  const available = items.filter((p) => p.status === 'Available').length;
  const priceDrops = items.filter(
    (p) => p.previousPrice != null && Number(p.price) < Number(p.previousPrice) && p.status !== 'Sold'
  ).length;
  const reserved = items.filter((p) => p.status === 'Reserved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">My Saved Items</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Items you've saved to keep an eye on.
      </p>

      {!isLoading && items.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <SummaryPill value={items.length} label={items.length === 1 ? 'Saved' : 'Saved'} />
          <SummaryPill value={available} label="Available" />
          <SummaryPill value={priceDrops} label={priceDrops === 1 ? 'Price Drop' : 'Price Drops'} />
          <SummaryPill value={reserved} label="Reserved" />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-6 py-10 text-center">
          <p className="text-4xl mb-3">🤍</p>
          <p className="font-semibold mb-1">Nothing saved yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tap the heart on any listing to save it here.
          </p>
          <Link
            to="/search"
            className="inline-block bg-primary-600 text-white font-medium px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((product) => (
            <SavedItemCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}