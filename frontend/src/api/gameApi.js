import axiosInstance from './axiosConfig';

export const gameApi = {
  // Obtener todos los juegos
  getAllGames: async () => {
    const response = await axiosInstance.get('/games');
    return response.data;
  },

  // Obtener juegos más recientes
  getLatestGames: async () => {
    const response = await axiosInstance.get('/games/latest');
    return response.data;
  },

  // Buscar juegos
  searchGames: async (query) => {
    const response = await axiosInstance.get(`/games/search?q=${query}`);
    return response.data;
  },

  // Obtener un juego por ID
  getGameById: async (id) => {
    const response = await axiosInstance.get(`/games/${id}`);
    return response.data;
  },

  // Importar juegos desde Steam (solo admin)
  importFromSteam: async () => {
    const response = await axiosInstance.post('/games/import-steam');
    return response.data;
  },
};