import React from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../Skeleton';
import WantedCard from '../WantedCard';

export default function WantedSection({ items, isLoading }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">People Are Looking For</h2>
        <Link to="/wanted" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full">No active requests right now.</p>
        ) : (
          items.map((wanted) => <WantedCard key={wanted._id} wanted={wanted} />)
        )}
      </div>
    </div>
  );
}