import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((res) => setData(res.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setAdding(true);
    const result = await addToCart(data.product.id, quantity);
    setAdding(false);
    if (result.success) {
      setFeedback('Added to cart!');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(result.error);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="h-80 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { product, recommendations } = data;
  const isOutOfStock = product.stockQty === 0;

  // Build breadcrumb
  const breadcrumb = [];
  if (product.category?.parent?.parent) breadcrumb.push(product.category.parent.parent);
  if (product.category?.parent) breadcrumb.push(product.category.parent);
  breadcrumb.push(product.category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        {breadcrumb.map((cat, i) => (
          <React.Fragment key={cat.id}>
            <span>›</span>
            <Link
              to={`/products?categoryId=${cat.id}`}
              className="hover:text-primary-600"
            >
              {cat.name}
            </Link>
          </React.Fragment>
        ))}
        <span>›</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>

      {/* Product detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="relative">
          <img
            src={product.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
            alt={product.name}
            className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-sm"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-semibold px-5 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{product.brand}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
          {product.sizeWeight && (
            <p className="text-gray-500 text-sm mt-1">{product.sizeWeight}</p>
          )}

          <div className="mt-4">
            <span className="text-3xl font-bold text-primary-700">
              SGD {parseFloat(product.price).toFixed(2)}
            </span>
          </div>

          {/* Stock status */}
          <div className="mt-3">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Out of Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                In Stock ({product.stockQty} available)
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm mt-5 leading-relaxed">{product.description}</p>
          )}

          {/* Quantity + Add to cart */}
          {!isOutOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-lg font-medium"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-lg font-medium"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 py-3 text-base"
              >
                {adding ? 'Adding...' : '🛍️ Add to Cart'}
              </button>
            </div>
          )}

          {feedback && (
            <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${
              feedback === 'Added to cart!'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {feedback}
            </div>
          )}

          <Link to="/cart" className="mt-4 text-sm text-primary-600 hover:text-primary-700">
            View cart →
          </Link>
        </div>
      </div>

      {/* Recommendations (FR-801) */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-5">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
