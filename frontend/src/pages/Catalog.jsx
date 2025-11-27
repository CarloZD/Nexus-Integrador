import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import GameCard from '../components/games/GameCard';
import { gameApi } from '../api/gameApi';
import toast from 'react-hot-toast';

export default function Catalog() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await gameApi.getAllGames();
      setGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Error al cargar los juegos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadGames();
      return;
    }

    try {
      setSearching(true);
      const data = await gameApi.searchGames(searchTerm);
      setGames(data);
    } catch (error) {
      console.error('Error searching games:', error);
      toast.error('Error al buscar juegos');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Catálogo de Juegos
          </h1>
          <p className="text-gray-600">
            Explora nuestra colección de juegos
          </p>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar juegos..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {searching ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Buscar'
              )}
            </button>
          </div>
        </form>

        {/* Grid de juegos */}
        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No se encontraron juegos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}