import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Loader2, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function ReviewSection({ gameId, userOwnsGame = false }) {
  const { getCurrentUser } = useAuth();
  const token = localStorage.getItem('token');
  const user = getCurrentUser();

  // Estados
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadReviews();
    loadReviewStats();
    if (token) {
      loadMyReview();
    }
  }, [gameId, token]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewApi.getGameReviews(gameId, 0, 10);
      setReviews(data.content || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const data = await reviewApi.getGameReviewStats(gameId);
      setReviewStats(data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const loadMyReview = async () => {
    try {
      const data = await reviewApi.getMyReviewForGame(gameId);
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

    if (!userOwnsGame) {
      toast.error('Debes poseer el juego para publicar una reseña');
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
        setEditMode(false);
      } else {
        await reviewApi.createReview(gameId, reviewRating, reviewText);
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

  const handleDeleteReview = async () => {
    if (!myReview) return;

    if (!window.confirm('¿Estás seguro de eliminar tu reseña?')) return;

    try {
      await reviewApi.deleteReview(myReview.id);
      toast.success('Reseña eliminada');
      setMyReview(null);
      setReviewText('');
      setReviewRating(5);
      await loadReviews();
      await loadReviewStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Error al eliminar reseña');
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

  const startEdit = () => {
    if (myReview) {
      setReviewText(myReview.comment || '');
      setReviewRating(myReview.rating || 5);
      setEditMode(true);
    }
  };

  const cancelEdit = () => {
    if (myReview) {
      setReviewText(myReview.comment || '');
      setReviewRating(myReview.rating || 5);
    }
    setEditMode(false);
  };

  // Calcular porcentaje de recomendaciones
  const recommendationPercentage = reviewStats && reviewStats.totalReviews > 0
    ? Math.round((reviewStats.positiveReviews / reviewStats.totalReviews) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Estadísticas de reviews */}
      {reviewStats && reviewStats.totalReviews > 0 && (
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full font-bold ${
              recommendationPercentage >= 70 ? 'bg-green-600' : 
              recommendationPercentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {recommendationPercentage}%
            </div>
            <span className="text-gray-300">Recomendado</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <MessageSquare size={18} />
            <span>{reviewStats.totalReviews} reseñas</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={star <= Math.round(reviewStats.averageRating || 0) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-500'}
              />
            ))}
            <span className="text-gray-300 ml-1">
              {(reviewStats.averageRating || 0).toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Sección de publicar/editar reseña */}
      {token && userOwnsGame && (!myReview || editMode) && (
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-3">
              {editMode ? 'Editar tu reseña' : 'Publica tu opinión'}
            </h3>
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
              <div className="flex gap-2">
                {editMode && (
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {submittingReview ? 'Publicando...' : editMode ? 'Actualizar' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mi reseña existente */}
      {token && myReview && !editMode && (
        <div className="bg-gray-700/50 border border-purple-500 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-white font-semibold">Tu reseña</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      size={14}
                      className={rating <= myReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                myReview.rating >= 4 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}>
                {myReview.rating >= 4 ? (
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
              <button
                onClick={startEdit}
                className="p-2 text-gray-400 hover:text-purple-400 transition"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDeleteReview}
                className="p-2 text-gray-400 hover:text-red-400 transition"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="text-gray-300">{myReview.comment}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(myReview.createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>
      )}

      {/* Mensaje si no posee el juego */}
      {token && !userOwnsGame && !myReview && (
        <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 text-center">
          <p className="text-gray-400">
            Debes poseer este juego para poder dejar una reseña
          </p>
        </div>
      )}

      {/* Lista de reseñas */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Reseñas de la comunidad</h2>
        {loadingReviews ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay reseñas aún. {userOwnsGame ? '¡Sé el primero en opinar!' : ''}
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.filter(r => r.id !== myReview?.id).map((review) => (
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
  );
}

