
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { getProducts, CATEGORIES } from '../services/productService';
import { useCart } from '../contexts/CartContext';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, isInCart } = useCart();

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    residence: searchParams.get('residence') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: searchParams.get('page') || '1',
  };

  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  // Each unique combination of filters gets its own cache entry via the
  // query key, so switching between two filter combos you've already
  // visited shows results instantly instead of refetching. keepPreviousData
  // means changing page/filters shows the previous results (dimmed slightly
  // below) while the new page loads, instead of flashing back to skeletons.
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  });

  const results = data || { products: [], page: 1, totalPages: 1, totalResults: 0 };

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const goToPage = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Filters sidebar */}
      <aside className="md:col-span-1 space-y-5 bg-white dark:bg-gray-800 p-4 rounded-lg h-fit">
        <h2 className="font-semibold">Filters</h2>

        <div>
          <label className="text-sm font-medium block mb-1">Search</label>
          <input
            type="text"
            defaultValue={filters.search}
            onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', e.target.value)}
            onBlur={(e) => updateFilter('search', e.target.value)}
            placeholder="Search products..."
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Residence</label>
          <select
            value={filters.residence}
            onChange={(e) => updateFilter('residence', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
          >
            <option value="">All Residences</option>
            <option value="Sokomoko">Sokomoko</option>
            <option value="KU">KU</option>
            <option value="Annex">Annex</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Condition</label>
          <select
            value={filters.condition}
            onChange={(e) => updateFilter('condition', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
          >
            <option value="">Any</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium block mb-1">Min Price</label>
            <input
              type="number"
              defaultValue={filters.minPrice}
              onBlur={(e) => updateFilter('minPrice', e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Max Price</label>
            <input
              type="number"
              defaultValue={filters.maxPrice}
              onBlur={(e) => updateFilter('maxPrice', e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
        </div>

        <button
          onClick={() => setSearchParams({})}
          className="text-sm text-primary-600 font-medium"
        >
          Clear all filters
        </button>
      </aside>

      {/* Results */}
      <div className="md:col-span-3">
        <p className="text-sm text-gray-500 mb-4">{results.totalResults} results found</p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : results.products.length === 0 ? (
          <p className="text-gray-500">No products match your filters.</p>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-4 transition-opacity ${
                isPlaceholderData ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {results.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={addToCart}
                  inCart={isInCart(product._id)}
                />
              ))}
            </div>

            {results.totalPages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-9 w-9 rounded-md text-sm ${
                      p === results.page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}