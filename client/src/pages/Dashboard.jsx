import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Loader from '../components/Loader';
import { getMyListings, deleteProduct, updateProductStatus } from '../services/productService';
import { getSellerIntelligence } from '../services/sellerService';
import { formatKsh, timeAgo } from '../utils/format';

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-orange-100 text-orange-700',
  Sold: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: getMyListings,
  });

  const { data: intelligence } = useQuery({
    queryKey: ['sellerIntelligence'],
    queryFn: getSellerIntelligence,
  });

  const intelById = new Map((intelligence?.listings || []).map((l) => [l._id, l]));

  // Both mutations invalidate ['myListings'] on success, which triggers an
  // automatic refetch - this replaces the old fetchListings() call that had
  // to be manually invoked after every status change and delete.
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['sellerIntelligence'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['sellerIntelligence'] });
    },
  });

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          to="/sell"
          className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-700"
        >
          + Upload Product
        </Link>
      </div>

      {intelligence && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Your Market
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-center shadow-sm min-w-[90px]">
              <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{intelligence.overview.views}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-center shadow-sm min-w-[90px]">
              <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{intelligence.overview.saves}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Saves</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-center shadow-sm min-w-[90px]">
              <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{intelligence.overview.contacts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Contacts</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-center shadow-sm min-w-[90px]">
              <p className="text-xl font-bold text-primary-700 dark:text-primary-300">
                {intelligence.overview.activeListings}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Listings</p>
            </div>
          </div>

          {intelligence.demand.length > 0 && (
            <div className="mt-4 bg-primary-50 dark:bg-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                People are looking for
              </p>
              <ul className="text-sm space-y-1">
                {intelligence.demand.map((d) => (
                  <li key={d.category}>
                    {d.count} {d.count === 1 ? 'student is' : 'students are'} looking for{' '}
                    <strong>{d.category}</strong>
                    {d.maxBudgetCap != null && ` under ${formatKsh(d.maxBudgetCap)}`}.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {listings.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t listed any products yet.</p>
      ) : (
        <div className="space-y-3">
          {listings.map((product) => {
            const intel = intelById.get(product._id);
            return (
            <div
              key={product._id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-4"
            >
              <img
                src={product.images[0] || ''}
                alt={product.title}
                loading="lazy"
                className="h-20 w-20 rounded-md object-cover bg-gray-100 dark:bg-gray-700"
              />

              <div className="flex-1">
                <p className="font-semibold">{product.title}</p>
                <p className="text-primary-700 dark:text-primary-300 font-bold text-sm">
                  {formatKsh(product.price)}
                </p>
                <p className="text-xs text-gray-500">
                  👀 {product.views} &middot; ❤️ {intel?.savesCount ?? 0} &middot; 💬 {intel?.contactsCount ?? 0}
                  &middot; Listed {timeAgo(product.createdAt)}
                </p>
                {intel?.performance === 'trending' && (
                  <p className="text-xs font-semibold text-orange-600 mt-1">🔥 Getting attention</p>
                )}
                {intel?.performance === 'slowing' && (
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    Activity is slowing. {intel.suggestion}
                  </p>
                )}
                {intel?.health?.missing?.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Missing: {intel.health.missing.join(', ')}
                  </p>
                )}
              </div>

              <span className={`text-xs font-semibold px-2 py-1 rounded-full h-fit ${STATUS_STYLES[product.status]}`}>
                {product.status}
              </span>

              <select
                value={product.status}
                onChange={(e) => handleStatusChange(product._id, e.target.value)}
                className="text-sm border rounded-md px-2 py-1.5 bg-white dark:bg-gray-900 dark:border-gray-600"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>

              <div className="flex gap-2">
                <Link
                  to={`/edit-product/${product._id}`}
                  className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-sm px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

