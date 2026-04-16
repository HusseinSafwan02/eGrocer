import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [fulfillment, setFulfillment] = useState('HOME_DELIVERY');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Link to="/login" className="btn-primary">Sign In to Checkout</Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (fulfillment === 'HOME_DELIVERY' && !address.trim()) {
      setError('Delivery address is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/orders', {
        fulfillment,
        address: fulfillment === 'HOME_DELIVERY' ? address : null,
        paymentMethod,
      });
      await fetchCart();
      navigate(`/orders?placed=${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: delivery + payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fulfilment (FR-401) */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-4">Fulfilment Method</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'HOME_DELIVERY', label: '🚚 Home Delivery', desc: 'Delivered to your door' },
                { value: 'WAREHOUSE_PICKUP', label: '🏪 Warehouse Pick-up', desc: 'Collect at our warehouse' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer border-2 rounded-xl p-4 transition-colors ${
                    fulfillment === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    checked={fulfillment === opt.value}
                    onChange={(e) => setFulfillment(e.target.value)}
                    className="sr-only"
                  />
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                </label>
              ))}
            </div>

            {fulfillment === 'HOME_DELIVERY' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="Block/Unit, Street, Singapore postal code"
                />
              </div>
            )}
          </div>

          {/* Payment (FR-501) */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: 'CARD', label: '💳 Credit / Debit Card' },
                { value: 'PAYNOW', label: '📱 PayNow / PayLah!' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 cursor-pointer border-2 rounded-xl px-4 py-3 transition-colors ${
                    paymentMethod === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-primary-600"
                  />
                  <span className="font-medium text-sm">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                🔒 Payment is processed securely. Card details are never stored on our servers (PCI-DSS compliant).
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="shrink-0">SGD {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>SGD {cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t">
                <span>Total</span>
                <span>SGD {cart.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-6 text-base"
            >
              {loading ? 'Placing Order...' : `Place Order · SGD ${cart.total.toFixed(2)}`}
            </button>

            <Link to="/cart" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3">
              ← Back to Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
