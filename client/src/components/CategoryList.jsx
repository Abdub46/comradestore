import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../services/productService';

const ICONS = {
  Beds: '🛏️', Sofas: '🛋️', 'Dining Tables': '🍽️', 'Office Chairs': '💺',
  'Plastic Chairs': '🪑', 'TV Stands': '📺', Wardrobes: '🚪', Cupboards: '🗄️',
  Mattresses: '🛌', Curtains: '🪟', 'Kitchen Items': '🍳', 'Gas Cookers': '🔥',
  Fridges: '🧊', Microwaves: '📦', Phones: '📱', Electronics: '🔌', Other: '📦',
};

export default function CategoryList() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Shop by Category</h2>
        <Link to="/search" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
          >
            <span className="text-3xl">{ICONS[cat] || '📦'}</span>
            <span className="text-xs text-center font-medium">{cat}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
