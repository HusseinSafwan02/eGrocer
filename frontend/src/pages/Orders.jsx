import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = {
  PROCESSING: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-blue-100 text-blue-700' },
  READY_FOR_PICKUP: { label: 'Ready for Pick-up', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function Orders() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const justPlaced = searchParams.get('placed');

  useEffect(() => {
    if (!user) return;
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Link to="/login" className="btn-primary">Sign In to View Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {justPlaced && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="text-sm mt-0.5">Your order #{justPlaced} is being processed. You'll receive a confirmation email shortly.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">📦</span>
          <h2 className="text-lg font-semibold text-gray-700 mt-4">No orders yet</h2>
          <p className="text-gray-500 text-sm mt-1">Your order history will appear here.</p>
          <Link to="/products" className="btn-primary mt-5 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
            return (
              <div key={order.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-bold text-gray-800">Order #{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.orderDate).toLocaleDateString('en-SG', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="font-bold text-primary-700">SGD {parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      )}
                      <span className="text-gray-600 flex-1">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-gray-800 font-medium">
                        SGD {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <span>{order.fulfillment === 'HOME_DELIVERY' ? '🚚 Home Delivery' : '🏪 Warehouse Pick-up'}</span>
                  {order.payment && (
                    <span>Payment: {order.payment.method} · {order.payment.status}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
