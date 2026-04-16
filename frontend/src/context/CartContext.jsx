import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0, itemCount: 0 });
      return;
    }
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      setCart(res.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add to cart';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setLoading(true);
    try {
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      setCart(res.data);
    } catch (err) {
      console.error('Failed to update quantity', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    setLoading(true);
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to remove item', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      await api.delete('/cart');
      setCart({ items: [], total: 0, itemCount: 0 });
    } catch (err) {
      console.error('Failed to clear cart', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
