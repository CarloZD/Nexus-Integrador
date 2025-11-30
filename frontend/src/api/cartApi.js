import axiosInstance from './axiosConfig';

export const cartApi = {
  // Obtener carrito actual
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  // Agregar juego al carrito
  addToCart: async (gameId, quantity = 1) => {
    const response = await axiosInstance.post('/cart/items', {
      gameId,
      quantity
    });
    return response.data;
  },

  // Actualizar cantidad de un item
  updateCartItem: async (itemId, quantity) => {
    const response = await axiosInstance.put(`/cart/items/${itemId}`, {
      quantity
    });
    return response.data;
  },

  // Eliminar item del carrito
  removeFromCart: async (itemId) => {
    const response = await axiosInstance.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Vaciar carrito
  clearCart: async () => {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  },
};