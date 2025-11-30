// frontend/src/hooks/useCart.js
import { useState, useEffect } from 'react';
import { cartApi } from '../api/cartApi';
import toast from 'react-hot-toast';

export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar carrito al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadCart();
    }
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error loading cart:', error);
      // No mostrar error si no está autenticado
      if (error.response?.status !== 401) {
        toast.error('Error al cargar el carrito');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (gameId, quantity = 1) => {
    try {
      setLoading(true);
      const data = await cartApi.addToCart(gameId, quantity);
      setCart(data);
      toast.success('Juego agregado al carrito');
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      const message = error.response?.data?.message || 'Error al agregar al carrito';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const data = await cartApi.updateCartItem(itemId, quantity);
      setCart(data);
      toast.success('Cantidad actualizada');
      return data;
    } catch (error) {
      console.error('Error updating cart:', error);
      const message = error.response?.data?.message || 'Error al actualizar cantidad';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const data = await cartApi.removeFromCart(itemId);
      setCart(data);
      toast.success('Juego eliminado del carrito');
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Error al eliminar del carrito');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      setCart({ items: [], total: 0, itemCount: 0 });
      toast.success('Carrito vaciado');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Error al vaciar el carrito');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getItemCount = () => {
    return cart?.itemCount || 0;
  };

  const getTotal = () => {
    return cart?.total || 0;
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    getItemCount,
    getTotal,
  };
};