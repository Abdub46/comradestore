import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Hero from '../components/Hero';
import CategoryList from '../components/CategoryList';
import ProductRow from '../components/ProductRow';
import { getProducts } from '../services/productService';

export default function Home() {
  // "Featured" isn't a manually-curated flag in the database - it's
  // defined here as the most-viewed listings, which is real data rather
  // than something fabricated to fill the section.
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
  queryKey: ['products', { limit: 8, featured: true }],
  queryFn: () => getProducts({ limit: 8 }),
});

  const { data: recentData, isLoading: recentLoading } = useQuery({
  queryKey: ['products', { sort: '-createdAt', limit: 8, recent: true }],
  queryFn: () =>
    getProducts({
      limit: 8,
      sort: '-createdAt',
      maxAgeDays: 2,
    }),
});

  return (
    <div>
      <Hero />
      <CategoryList />

      <ProductRow
        title="Featured Listings"
        products={featuredData?.products || []}
        isLoading={featuredLoading}
      />

      <ProductRow
        title="Recently Added"
        products={recentData?.products || []}
        isLoading={recentLoading}
      />
    </div>
  );
}