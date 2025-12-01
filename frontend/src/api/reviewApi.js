import axiosInstance from './axiosConfig';

export const reviewApi = {
  // Obtener reviews de un juego
  getGameReviews: async (gameId, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/reviews/game/${gameId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Obtener reviews más útiles
  getMostHelpfulReviews: async (gameId, page = 0, size = 5) => {
    const response = await axiosInstance.get(`/reviews/game/${gameId}/helpful`, {
      params: { page, size }
    });
    return response.data;
  },

  // Obtener estadísticas de reviews
  getGameReviewStats: async (gameId) => {
    const response = await axiosInstance.get(`/reviews/game/${gameId}/stats`);
    return response.data;
  },

  // Obtener mi review para un juego
  getMyReviewForGame: async (gameId) => {
    try {
      const response = await axiosInstance.get(`/reviews/game/${gameId}/my-review`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 204) {
        return null;
      }
      throw error;
    }
  },

  // Crear review
  createReview: async (gameId, rating, comment) => {
    const response = await axiosInstance.post('/reviews', {
      gameId,
      rating,
      comment
    });
    return response.data;
  },

  // Actualizar review
  updateReview: async (reviewId, rating, comment) => {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, {
      rating,
      comment
    });
    return response.data;
  },

  // Eliminar review
  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Marcar como útil
  markAsHelpful: async (reviewId) => {
    const response = await axiosInstance.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },
};

