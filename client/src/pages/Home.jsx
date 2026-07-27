import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Hero from '../components/Hero';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { getProducts } from '../services/productService';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const { addToCart, isInCart } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: () => getProducts({ limit: 8, sort: '-createdAt' }),
  });

  const latest = data?.products || [];

  return (
    <div>
      <Hero />
      <CategoryList />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Latest Listings</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <p className="text-gray-500">No listings yet. Be the first to sell an item!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {latest.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                inCart={isInCart(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}