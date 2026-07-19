import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { getMyListings, deleteProduct, updateProductStatus } from '../services/productService';
import { formatKsh, timeAgo } from '../utils/format';

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-orange-100 text-orange-700',
  Sold: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    setLoading(true);
    getMyListings()
      .then(setListings)
      .finally(() => setLoading(false));
  };

  useEffect(fetchListings, []);

  const handleStatusChange = async (id, status) => {
    await updateProductStatus(id, status);
    fetchListings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    await deleteProduct(id);
    fetchListings();
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          to="/sell"
          className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-700"
        >
          + Upload Product
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t listed any products yet.</p>
      ) : (
        <div className="space-y-3">
          {listings.map((product) => (
            <div
              key={product._id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-4"
            >
              <img
                src={product.images[0] || ''}
                alt={product.title}
                className="h-20 w-20 rounded-md object-cover bg-gray-100 dark:bg-gray-700"
              />

              <div className="flex-1">
                <p className="font-semibold">{product.title}</p>
                <p className="text-primary-700 dark:text-primary-300 font-bold text-sm">
                  {formatKsh(product.price)}
                </p>
                <p className="text-xs text-gray-500">
                  {product.views} views &middot; Listed {timeAgo(product.createdAt)}
                </p>
              </div>

              <span className={`text-xs font-semibold px-2 py-1 rounded-full h-fit ${STATUS_STYLES[product.status]}`}>
                {product.status}
              </span>

              <select
                value={product.status}
                onChange={(e) => handleStatusChange(product._id, e.target.value)}
                className="text-sm border rounded-md px-2 py-1.5 bg-white dark:bg-gray-900 dark:border-gray-600"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>

              <div className="flex gap-2">
                <Link
                  to={`/edit-product/${product._id}`}
                  className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-sm px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
