import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { user } = useAuth();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl">🛍️</span>
        <h2 className="text-xl font-bold text-gray-800 mt-4">Sign in to view your cart</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">Your cart is saved across sessions when you're logged in.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="text-xl font-bold text-gray-800 mt-4">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">Add some fresh groceries to get started!</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="card p-4 flex gap-4">
              <img
                src={item.image || 'https://via.placeholder.com/80?text=Item'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase">{item.brand}</p>
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                <p className="text-primary-700 font-bold mt-1">
                  SGD {item.unitPrice.toFixed(2)} each
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                      className="px-2.5 py-1 hover:bg-gray-100 disabled:opacity-30 text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.stockQty}
                      className="px-2.5 py-1 hover:bg-gray-100 disabled:opacity-30 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-800">
                      SGD {item.subtotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-600 text-sm transition-colors"
                      aria-label="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-800 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="shrink-0">SGD {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span>
                <span>SGD {cart.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Delivery fee calculated at checkout</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-3 mt-6 text-base"
            >
              Proceed to Checkout
            </button>

            <Link to="/products" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
