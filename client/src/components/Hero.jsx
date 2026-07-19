import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Buy &amp; Sell Second-Hand Household Items
        </h1>
        <p className="text-primary-50 max-w-2xl mx-auto mb-8">
          Beds, sofas, kitchen items, electronics and more &mdash; find great deals near you,
          or list your own items in minutes. Chat directly with sellers on WhatsApp.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/search"
            className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50"
          >
            Browse Items
          </Link>
          <Link
            to="/sell"
            className="bg-primary-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-900"
          >
            Sell an Item
          </Link>
        </div>
      </div>
    </div>
  );
}
