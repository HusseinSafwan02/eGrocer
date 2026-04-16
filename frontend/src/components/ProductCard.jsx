import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  const isOutOfStock = product.stockQty === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setAdding(true);
    const result = await addToCart(product.id, 1);
    setAdding(false);
    if (result.success) {
      setFeedback('Added!');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setFeedback(result.error);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="card flex flex-col overflow-hidden group hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
        {product.sizeWeight && (
          <p className="text-xs text-gray-400 mt-0.5">{product.sizeWeight}</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-bold text-primary-700 text-base">
            SGD {parseFloat(product.price).toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : feedback === 'Added!'
                ? 'bg-green-100 text-green-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {adding ? '...' : feedback || (isOutOfStock ? 'Out of Stock' : '+ Add')}
          </button>
        </div>

        {feedback && feedback !== 'Added!' && (
          <p className="text-xs text-red-500 mt-1">{feedback}</p>
        )}
      </div>
    </Link>
  );
}
