import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Loader from '../components/Loader';
import { getProductById, markAsContacted, deleteProduct } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatKsh, timeAgo } from '../utils/format';
import { buildWhatsAppLink } from '../utils/whatsapp';
import FavoriteButton from '../components/FavoriteButton';

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-orange-100 text-orange-700',
  Sold: 'bg-red-100 text-red-700',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
  });

  // Invalidates the seller's Dashboard list and the public product lists,
  // so a deleted listing doesn't linger in any cached page the next time
  // someone visits it.
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/dashboard');
    },
  });

  if (isLoading) return <Loader />;
  if (!product) return <p className="text-center py-20">Product not found.</p>;

  const isSold = product.status === 'Sold';
  const inCart = isInCart(product._id);
  const isOwner = Boolean(user && product.seller && user._id === product.seller._id);

  // Clicking "Contact Seller" opens WhatsApp in a new tab (target="_blank"),
  // so this tab stays open and this request still completes in the
  // background. Updates the cached product directly via setQueryData
  // instead of separate component state, so the cache and the screen can
  // never disagree with each other.
const handleContactSeller = () => {
    markAsContacted(product._id, product.contactToken)
      .then(() => {
        queryClient.setQueryData(['product', id], (old) => (old ? { ...old, status: 'Sold' } : old));
      })
      .catch((err) => console.error('Failed to update product status:', err));
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    deleteMutation.mutate();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image gallery */}
      <div>
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
          {product.images.length > 0 ? (
            <img
              src={product.images[activeImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                  i === activeImage ? 'border-primary-600' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[product.status]}`}>
            {product.status}
          </span>
          <span className="text-xs text-gray-500">{timeAgo(product.createdAt)}</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">{product.title}</h1>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
            {formatKsh(product.price)}
          </p>
          <FavoriteButton product={product} size="lg" />
        </div>

        <div className="flex gap-4 text-sm text-gray-500 mb-4">
          <span>{product.condition}</span>
          <span>&middot;</span>
          <span>{product.residence}</span>
        </div>

        <p className="text-sm leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>

        <div className="flex gap-3 mb-6">
          {isOwner ? (
            <>
              <Link
                to={`/edit-product/${product._id}`}
                className="flex-1 text-center bg-gray-100 dark:bg-gray-700 font-medium py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-50 text-red-600 font-medium py-2.5 rounded-md hover:bg-red-100"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => addToCart(product)}
              disabled={isSold || inCart}
              className="flex-1 bg-gray-100 dark:bg-gray-700 font-medium py-2.5 rounded-md disabled:opacity-50"
            >
              {isSold ? 'Sold Out' : inCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
          )}
          {isOwner ? (
            <span
              className="flex-1 text-center font-medium py-2.5 rounded-md text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              title="You can't contact yourself about your own listing"
            >
              Contact Seller on WhatsApp
            </span>
          ) : (
            <a
              href={buildWhatsAppLink(product.seller.phone, product.title)}
              target="_blank"
              rel="noreferrer"
              onClick={handleContactSeller}
              className={`flex-1 text-center font-medium py-2.5 rounded-md text-white ${
                isSold ? 'bg-gray-300 pointer-events-none' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Contact Seller on WhatsApp
            </a>
          )}
        </div>

        {/* Seller card */}
        <Link
          to={`/product/${product._id}`}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg"
        >
          <img
            src={product.seller.avatar}
            alt={product.seller.firstName}
            loading="lazy"
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{product.seller.firstName} {product.seller.lastName}</p>
            <p className="text-xs text-gray-500">
              {product.seller.residence} &middot; Joined {timeAgo(product.seller.createdAt)}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}