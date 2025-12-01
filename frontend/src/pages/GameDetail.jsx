import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Heart, Calendar, User, Building, DollarSign, 
  Loader2, CheckCircle, Package, ThumbsUp, ThumbsDown, Star, 
  Users, Globe, Gamepad2, MessageSquare
} from 'lucide-react';
import { gameApi } from '../api/gameApi';
import { reviewApi } from '../api/reviewApi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosConfig';

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getCurrentUser } = useAuth();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const token = localStorage.getItem('token');
  const user = getCurrentUser();

  useEffect(() => {
    loadGame();
    if (token) {
      loadFavoriteStatus();
      loadMyReview();
    }
    loadReviews();
    loadReviewStats();
  }, [id, token]);

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

  const loadFavoriteStatus = async () => {
    try {
      const response = await axiosInstance.get(`/user/favorites/${id}/check`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return;
    }

    setFavoriteLoading(true);
    try {
      const url = `/user/favorites/${id}`;
      const method = isFavorite ? 'DELETE' : 'POST';
      
      await axiosInstance({ method, url });
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewApi.getGameReviews(id, 0, 10);
      setReviews(data.content || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const data = await reviewApi.getGameReviewStats(id);
      setReviewStats(data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const loadMyReview = async () => {
    try {
      const data = await reviewApi.getMyReviewForGame(id);
      setMyReview(data);
      if (data) {
        setReviewText(data.comment || '');
        setReviewRating(data.rating || 5);
      }
    } catch (error) {
      console.error('Error loading my review:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para publicar una reseña');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Por favor escribe tu reseña');
      return;
    }

    setSubmittingReview(true);
    try {
      if (myReview) {
        await reviewApi.updateReview(myReview.id, reviewRating, reviewText);
        toast.success('Reseña actualizada');
      } else {
        await reviewApi.createReview(id, reviewRating, reviewText);
        toast.success('Reseña publicada');
      }
      await loadMyReview();
      await loadReviews();
      await loadReviewStats();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Error al publicar reseña');
    } finally {
      setSubmittingReview(false);
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

  const markReviewHelpful = async (reviewId) => {
    if (!token) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      await reviewApi.markAsHelpful(reviewId);
      await loadReviews();
      toast.success('Marcado como útil');
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error(error.response?.data?.message || 'Error al marcar como útil');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Juego no encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="text-purple-400 hover:text-purple-300"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // Parsear screenshots
  const screenshots = game.screenshots ? game.screenshots.split(',').filter(s => s.trim()) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Header con título */}
      <div className="bg-gray-800 border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-300 mb-4 hover:text-purple-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <div className="flex items-start gap-6">
            {/* Imagen principal del juego */}
            <div className="flex-shrink-0">
              <img
                src={game.headerImage || game.coverImageUrl}
                alt={game.title}
                className="w-64 h-80 object-cover rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/256x320/4c1d95/ffffff?text=No+Image';
                }}
              />
              {/* Thumbnails de screenshots */}
              {screenshots.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {screenshots.slice(0, 5).map((screenshot, idx) => (
                    <img
                      key={idx}
                      src={screenshot.trim()}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-16 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(screenshot.trim(), '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Información del juego */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">{game.title}</h1>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {game.shortDescription || game.description || 'Sin descripción disponible'}
              </p>
              
              {game.genres && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.genres.split(',').slice(0, 2).map((genre, index) => (
                    <span
                      key={index}
                      className="bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                {game.stock > 0 ? (
                  <span className="text-green-400 font-semibold">DISPONIBLE</span>
                ) : (
                  <span className="text-red-400 font-semibold">AGOTADO</span>
                )}
              </div>
            </div>

            {/* Precio y botón de compra */}
            <div className="flex-shrink-0 text-right">
              <div className="mb-4">
                {game.isFree ? (
                  <div className="text-3xl font-bold text-green-400">GRATIS</div>
                ) : (
                  <div className="text-3xl font-bold text-green-400">
                    ${parseFloat(game.price).toFixed(2)}
                  </div>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || game.stock <= 0 || addedToCart}
                className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Agregando...
                  </>
                ) : addedToCart ? (
                  <>
                    <CheckCircle size={18} />
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Agregar al carrito
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sección de publicar reseña */}
            {token && (
              <div className="bg-gray-800 border-2 border-purple-700 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-3">Publica tu opinión</h3>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Escribe aquí tu reseña"
                      className="w-full bg-gray-700 text-white rounded-lg p-3 mb-3 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      rows={4}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setReviewRating(rating)}
                            className={`p-1 ${reviewRating >= rating ? 'text-yellow-400' : 'text-gray-500'}`}
                          >
                            <Star size={20} fill={reviewRating >= rating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {submittingReview ? 'Publicando...' : 'Publica tu opinión'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de reseñas */}
            <div className="bg-gray-800 border-2 border-purple-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Reseñas</h2>
              {loadingReviews ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-purple-500" size={32} />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay reseñas aún. Sé el primero en opinar!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-700 border border-purple-600 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{review.username}</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Star
                                  key={rating}
                                  size={14}
                                  className={rating <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          review.rating >= 4 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {review.rating >= 4 ? (
                            <>
                              <ThumbsUp size={14} />
                              RECOMENDADO
                            </>
                          ) : (
                            <>
                              <ThumbsDown size={14} />
                              NO RECOMENDADO
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 mb-3">{review.comment}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <button
                          onClick={() => markReviewHelpful(review.id)}
                          className="flex items-center gap-1 hover:text-purple-400 transition"
                          disabled={!token}
                        >
                          <ThumbsUp size={16} />
                          Útil ({review.helpful || 0})
                        </button>
                        <span>{new Date(review.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Especificaciones */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border-2 border-purple-700 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Especificaciones</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <User size={20} className="text-purple-400" />
                  <span>Un jugador</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Users size={20} className="text-purple-400" />
                  <span>Multijugador masivo</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Globe size={20} className="text-purple-400" />
                  <span>JcJ en línea</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Gamepad2 size={20} className="text-purple-400" />
                  <span>Cooperativo en línea</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Precio</h3>
                  {game.isFree ? (
                    <span className="text-2xl font-bold text-green-400">GRATIS</span>
                  ) : (
                    <span className="text-2xl font-bold text-green-400">
                      ${parseFloat(game.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {!game.isFree && game.stock > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-300 mb-2">Cantidad</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
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
                        className="w-16 text-center bg-gray-700 text-white rounded py-1"
                      />
                      <button
                        onClick={incrementQuantity}
                        disabled={quantity >= game.stock}
                        className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Máximo {game.stock} unidades</p>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || game.stock <= 0 || addedToCart}
                    className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      addedToCart
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {addingToCart ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : addedToCart ? (
                      <>
                        <CheckCircle size={18} />
                        Agregado
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        Agregar al carrito
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart || game.stock <= 0}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Comprar ahora
                  </button>

                  {token && (
                    <button
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                      className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        isFavorite
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                      {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                    </button>
                  )}
                </div>

                {game.stock > 0 ? (
                  <div className="mt-4 p-2 bg-green-900/30 border border-green-500 rounded text-center">
                    <p className="text-sm text-green-400">
                      ✓ En stock / {game.stock} disponibilidad
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-2 bg-red-900/30 border border-red-500 rounded text-center">
                    <p className="text-sm text-red-400">✗ Agotado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
