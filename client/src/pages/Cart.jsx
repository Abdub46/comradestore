import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatKsh } from '../utils/format';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { markAsContacted } from '../services/productService';

export default function Cart() {
  const { items, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Browse the marketplace and add items you&apos;re interested in.</p>
        <Link to="/search" className="text-primary-600 font-medium">
          Browse products &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-600 font-medium">
          Clear cart
        </button>
      </div>

      <div className="space-y-3">
        {items.map((product) => (
          <div key={product._id} className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-4">
            <img
              src={product.images[0] || ''}
              alt={product.title}
              className="h-16 w-16 rounded-md object-cover bg-gray-100 dark:bg-gray-700"
            />
            <div className="flex-1">
              <Link to={`/product/${product._id}`} className="font-medium hover:text-primary-600">
                {product.title}
              </Link>
              <p className="text-primary-700 dark:text-primary-300 font-bold text-sm">
                {formatKsh(product.price)}
              </p>
            </div>
            <a
              href={buildWhatsAppLink(product.seller.phone, product.title)}
              target="_blank"
              rel="noreferrer"
              onClick={() => markAsContacted(product._id).catch((err) => console.error(err))}
              className="text-sm px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Contact Seller
            </a>
            <button
              onClick={() => removeFromCart(product._id)}
              className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-6">
        This cart is just a shortlist &mdash; there&apos;s no online checkout. Message each seller
        directly on WhatsApp to arrange payment and pickup.
      </p>
    </div>
  );
}
