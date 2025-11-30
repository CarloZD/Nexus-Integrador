import { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Heart } from 'lucide-react';

export default function GameCard({ game }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      checkFavorite();
    }
  }, [game.id]);

  const checkFavorite = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/user/favorites/${game.id}/check`,
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

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:8080/api/user/favorites/${game.id}`;
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
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    window.location.href = `/game/${game.id}`;
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative cursor-pointer"
    >
      {token && (
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
      )}

      <div className="relative h-48 overflow-hidden">
        <img
          src={game.headerImage || '/placeholder-game.jpg'}
          alt={game.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/460x215/1e3a8a/ffffff?text=No+Image';
          }}
        />
        {game.isFree && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            GRATIS
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {game.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {game.shortDescription || 'Sin descripción disponible'}
        </p>

        {game.genres && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.genres.split(',').slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
              >
                {genre.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            {game.isFree ? (
              <span className="text-xl font-bold text-green-600">GRATIS</span>
            ) : (
              <div className="flex items-center gap-1">
                <DollarSign size={20} className="text-primary-600" />
                <span className="text-2xl font-bold text-primary-600">
                  {parseFloat(game.price).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            Ver
          </button>
        </div>
      </div>
    </div>
  );
}