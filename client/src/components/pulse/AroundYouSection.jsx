import React from 'react';
import { useNavigate } from 'react-router-dom';
import PulseRow from './PulseRow';
import ProductRowCard from '../ProductRowCard';

const RESIDENCES = ['Sokomoko', 'KU', 'Annex'];

export default function AroundYouSection({ residence, products, isLoading }) {
  const navigate = useNavigate();

  if (!isLoading && !residence) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Around You</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-5 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Explore listings by residence.</p>
          <div className="flex flex-wrap gap-2">
            {RESIDENCES.map((r) => (
              <button
                key={r}
                onClick={() => navigate(`/search?residence=${encodeURIComponent(r)}`)}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-primary-300 hover:bg-primary-100"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PulseRow
      title={`Around You${residence ? ` — ${residence}` : ''}`}
      items={products}
      isLoading={isLoading}
      emptyMessage="No listings near you yet. Check back soon."
      renderCard={(product) => <ProductRowCard key={product._id} product={product} />}
    />
  );
}