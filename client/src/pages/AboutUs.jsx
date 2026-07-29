import React from 'react';

export default function AboutUs() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">About CampusMarket</h1>
      <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <p>
          CampusMarket is a peer-to-peer marketplace built for students living in
          Sokomoko, KU, and Annex to buy and sell second-hand household items
          directly with one another.
        </p>
        <p>
          Listing an item takes minutes, and every sale happens directly between
          buyer and seller over WhatsApp &mdash; no payments, no shipping, no
          middleman. Just students helping students furnish their space
          affordably.
        </p>
        <p>
          Whether you&apos;re moving out and need to sell your bed, or you just
          arrived and need a cooker, CampusMarket connects you with people in
          your own residence community.
        </p>
      </div>
    </div>
  );
}