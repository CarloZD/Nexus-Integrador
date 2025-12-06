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
      // Si el carrito está vacío, inicializar con estructura vacía
      setCart(data || { items: [], total: 0, itemCount: 0 });
    } catch (error) {
      console.error('Error loading cart:', error);
      // Si el error es 400, 401, 404 o el usuario no está autenticado, inicializar vacío sin mostrar error
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 404) {
        // Error 400 puede ser por autenticación inválida, 401 es no autenticado, 404 es no encontrado
        setCart({ items: [], total: 0, itemCount: 0 });
      } else {
        // Solo mostrar error para otros casos (500, etc.)
        toast.error('Error al cargar el carrito');
        setCart({ items: [], total: 0, itemCount: 0 });
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
      toast.success('agregado al carrito');
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