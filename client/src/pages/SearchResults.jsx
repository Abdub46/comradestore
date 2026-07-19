import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { getProducts, CATEGORIES } from '../services/productService';
import { useCart } from '../contexts/CartContext';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], page: 1, totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);
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

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    getProducts(params)
      .then(setData)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
        <p className="text-sm text-gray-500 mb-4">{data.totalResults} results found</p>

        {loading ? (
          <Loader />
        ) : data.products.length === 0 ? (
          <p className="text-gray-500">No products match your filters.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {data.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={addToCart}
                  inCart={isInCart(product._id)}
                />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-9 w-9 rounded-md text-sm ${
                      p === data.page
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
