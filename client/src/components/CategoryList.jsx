import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <h2 className="text-xl font-semibold mb-4">Shop by Category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <span className="text-2xl">{ICONS[cat] || '📦'}</span>
            <span className="text-xs text-center">{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
