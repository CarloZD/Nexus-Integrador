import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Calendar, User, Building, DollarSign, Loader2, CheckCircle, Package } from 'lucide-react';
import { gameApi } from '../api/gameApi';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadGame();
  }, [id]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const data = await gameApi.getGameById(id);
      setGame(data);
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error('Error al cargar el juego');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para agregar al carrito');
      return;
    }

    if (game.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }

    if (quantity > game.stock) {
      toast.error(`Solo hay ${game.stock} unidades disponibles`);
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(game.id, quantity);
      setAddedToCart(true);
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para comprar');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(game.id, quantity);
      navigate('/cart');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < game.stock) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Stock máximo: ${game.stock} unidades`);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
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
            onClick={() => navigate('/')}
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
              onClick={() => navigate(-1)}
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
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x450/1e3a8a/ffffff?text=No+Image';
                }}
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

                <div className="flex items-start gap-3">
                  <Package className="text-primary-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Stock disponible</p>
                    <p className="font-semibold text-gray-900">
                      {game.stock > 0 ? `${game.stock} unidades` : 'Agotado'}
                    </p>
                  </div>
                </div>
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

              {/* Selector de cantidad */}
              {!game.isFree && game.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        if (val >= 1 && val <= game.stock) {
                          setQuantity(val);
                        }
                      }}
                      min="1"
                      max={game.stock}
                      className="w-20 text-center border border-gray-300 rounded-lg py-2 font-semibold"
                    />
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= game.stock}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {game.stock} unidades
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || game.stock <= 0 || addedToCart}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Agregando...
                    </>
                  ) : addedToCart ? (
                    <>
                      <CheckCircle size={20} />
                      ¡Agregado al carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Agregar al carrito
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || game.stock <= 0}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comprar ahora
                </button>
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

              {/* Subtotal */}
              {!game.isFree && quantity > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${(parseFloat(game.price) * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}