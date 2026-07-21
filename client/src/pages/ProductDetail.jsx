import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { getProductById, markAsContacted, deleteProduct } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatKsh, timeAgo } from '../utils/format';
import { buildWhatsAppLink } from '../utils/whatsapp';

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-orange-100 text-orange-700',
  Sold: 'bg-red-100 text-red-700',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <p className="text-center py-20">Product not found.</p>;

  const isSold = product.status === 'Sold';
  const inCart = isInCart(product._id);
  const isOwner = Boolean(user && product.seller && user._id === product.seller._id);

  // Clicking "Contact Seller" opens WhatsApp in a new tab (target="_blank"),
  // so this tab stays open and this request still completes in the background.
  const handleContactSeller = () => {
    markAsContacted(product._id)
      .then(() => setProduct((prev) => ({ ...prev, status: 'Sold' })))
      .catch((err) => console.error('Failed to update product status:', err));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await deleteProduct(product._id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
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
                <img src={img} alt="" className="w-full h-full object-cover" />
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
        <p className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-4">
          {formatKsh(product.price)}
        </p>

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
          
            href={buildWhatsAppLink(product.seller.phone, product.title)}
            target="_blank"
            rel="noreferrer"
            onClick={handleContactSeller}
            className={`flex-1 text-center font-medium py-2.5 rounded-md text-white ${
              isSold ? 'bg-gray-300 pointer-events-none' : 'bg-green-600 hover:bg-green-700'
            }`}
          <a>
            Contact Seller on WhatsApp
          </a>
        </div>



        {/* Seller card */}
        <Link
          to={`/product/${product._id}`}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg"
        >
          <img
            src={product.seller.avatar}
            alt={product.seller.firstName}
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
