import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { getProducts } from '../services/productService';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    getProducts({ limit: 8, sort: '-createdAt' })
      .then((data) => setLatest(data.products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Hero />
      <SearchBar />
      <CategoryList />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Latest Listings</h2>
        {loading ? (
          <Loader />
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
