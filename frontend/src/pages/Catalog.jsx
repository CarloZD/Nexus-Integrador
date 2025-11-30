import { useState, useEffect } from 'react';
import { Search, Loader2, Filter, X } from 'lucide-react';
import GameCard from '../components/games/GameCard';
import { gameApi } from '../api/gameApi';
import toast from 'react-hot-toast';

export default function Catalog() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Lista de géneros disponibles
  const availableGenres = [
    'Action',
    'Adventure',
    'RPG',
    'Strategy',
    'Indie',
    'Shooter',
    'Puzzle',
    'Platformer',
    'Roguelike',
    'Simulation',
    'MOBA',
    'FPS',
    'Battle Royale',
    'Survival',
    'Horror'
  ];

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, selectedGenres]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await gameApi.getAllGames();
      setGames(data);
      setFilteredGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Error al cargar los juegos');
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    if (selectedGenres.length === 0) {
      setFilteredGames(games);
      return;
    }

    const filtered = games.filter(game => {
      if (!game.genres) return false;
      
      const gameGenres = game.genres.toLowerCase();
      return selectedGenres.some(genre => 
        gameGenres.includes(genre.toLowerCase())
      );
    });

    setFilteredGames(filtered);
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
      setFilteredGames(data);
    } catch (error) {
      console.error('Error searching games:', error);
      toast.error('Error al buscar juegos');
    } finally {
      setSearching(false);
    }
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const clearFilters = () => {
    setSelectedGenres([]);
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
            Explora nuestra colección de {filteredGames.length} juegos
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 space-y-4">
          {/* Búsqueda */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar juegos..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {searching ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Search size={20} />
                  Buscar
                </>
              )}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Filter size={20} />
              Filtros
              {selectedGenres.length > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedGenres.length}
                </span>
              )}
            </button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtrar por Género</h3>
                {selectedGenres.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <X size={16} />
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {selectedGenres.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Mostrando {filteredGames.length} juegos de {games.length} totales
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Chips de filtros activos */}
          {selectedGenres.length > 0 && !showFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {selectedGenres.map(genre => (
                <span
                  key={genre}
                  className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {genre}
                  <button
                    onClick={() => toggleGenre(genre)}
                    className="hover:text-primary-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        {/* Grid de juegos */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {selectedGenres.length > 0 
                ? 'No se encontraron juegos con los filtros seleccionados'
                : 'No se encontraron juegos'
              }
            </p>
            {selectedGenres.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}