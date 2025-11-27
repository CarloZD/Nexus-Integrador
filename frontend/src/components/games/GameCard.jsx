import { ShoppingCart, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Imagen */}
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
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            GRATIS
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {game.title}
        </h3>

        {/* Descripción corta */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {game.shortDescription || 'Sin descripción disponible'}
        </p>

        {/* Géneros */}
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

        {/* Precio y botón */}
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

          <Link
            to={`/game/${game.id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            Ver
          </Link>
        </div>
      </div>
    </div>
  );
}