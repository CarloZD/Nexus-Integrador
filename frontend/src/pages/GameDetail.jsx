import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Calendar, User, Building, DollarSign, Loader2 } from 'lucide-react';
import { gameApi } from '../api/gameApi';
import toast from 'react-hot-toast';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadGame();
  }, [id]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const data = await gameApi.getGameById(id);
      setGame(data);
      
      if (token) {
        checkFavorite();
      }
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error('Error al cargar el juego');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/user/favorites/${id}/check`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return;
    }

    try {
      const url = `http://localhost:8080/api/user/favorites/${id}`;
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const handleAddToCart = () => {
    toast.success('¡Agregado al carrito!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Juego no encontrado</h2>
          <button
            onClick={() => window.location.href = '/'}
            className="text-primary-600 hover:text-primary-700"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con imagen de fondo */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${game.backgroundImage})` 
        }}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white mb-6 hover:text-primary-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            
            <h1 className="text-5xl font-bold text-white mb-4">{game.title}</h1>
            
            {game.genres && (
              <div className="flex flex-wrap gap-2">
                {game.genres.split(',').map((genre, index) => (
                  <span
                    key={index}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2">
            {/* Imagen principal */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <img
                src={game.headerImage}
                alt={game.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acerca de este juego</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {game.description || game.shortDescription || 'Sin descripción disponible'}
              </p>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Información del juego</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.developer && (
                  <div className="flex items-start gap-3">
                    <User className="text-primary-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Desarrollador</p>
                      <p className="font-semibold text-gray-900">{game.developer}</p>
                    </div>
                  </div>
                )}

                {game.publisher && (
                  <div className="flex items-start gap-3">
                    <Building className="text-primary-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Distribuidor</p>
                      <p className="font-semibold text-gray-900">{game.publisher}</p>
                    </div>
                  </div>
                )}

                {game.releaseDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="text-primary-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Fecha de lanzamiento</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(game.releaseDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {game.categories && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Categorías</p>
                  <div className="flex flex-wrap gap-2">
                    {game.categories.split(',').map((category, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm"
                      >
                        {category.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Compra */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              {/* Precio */}
              <div className="mb-6">
                {game.isFree ? (
                  <div className="text-4xl font-bold text-green-600">GRATIS</div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <DollarSign size={32} className="text-primary-600" />
                    <span className="text-4xl font-bold text-primary-600">
                      {parseFloat(game.price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Agregar al carrito
                </button>

                {token && (
                  <button
                    onClick={toggleFavorite}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isFavorite
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart 
                      size={20} 
                      className={isFavorite ? 'fill-current' : ''}
                    />
                    {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                  </button>
                )}
              </div>

              {/* Stock info */}
              {game.stock > 0 ? (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 text-center">
                    ✓ En stock ({game.stock} disponibles)
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 text-center">
                    ✗ Agotado temporalmente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}