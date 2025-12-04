import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Loader2, MessageSquare, Edit2, Trash2, User, Lock } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function ReviewSection({ gameId, userOwnsGame = false }) {
  const { getCurrentUser } = useAuth();
  const token = localStorage.getItem('token');
  const user = getCurrentUser();

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
    if (!token) return toast.error('Debes iniciar sesión');
    if (!userOwnsGame) return toast.error('Debes poseer el juego');
    if (!reviewText.trim()) return toast.error('Escribe tu reseña');
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      return toast.error('La calificación debe estar entre 1 y 5 estrellas');
    }
    if (!gameId) {
      return toast.error('Error: ID del juego no válido');
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
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al publicar reseña';
      toast.error(errorMessage);
      console.error('Error al publicar reseña:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview || !window.confirm('¿Eliminar reseña?')) return;
    try {
      await reviewApi.deleteReview(myReview.id);
      toast.success('Reseña eliminada');
      setMyReview(null);
      setReviewText('');
      setReviewRating(5);
      await loadReviews();
      await loadReviewStats();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const markReviewHelpful = async (reviewId) => {
    if (!token) return toast.error('Debes iniciar sesión');
    try {
      await reviewApi.markAsHelpful(reviewId);
      await loadReviews();
      toast.success('Marcado como útil');
    } catch (error) {
      toast.error('Error al marcar como útil');
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

  // Cálculo seguro del porcentaje
  const positiveReviewsCount = reviewStats?.ratingDistribution 
    ? (reviewStats.ratingDistribution[4] || 0) + (reviewStats.ratingDistribution[5] || 0)
    : 0;

  const recommendationPercentage = reviewStats && reviewStats.totalReviews > 0
    ? Math.round((positiveReviewsCount / reviewStats.totalReviews) * 100)
    : 0;

  return (
    <div className="space-y-8 font-sans text-white">
      
      {/* --- HEADER DE ESTADÍSTICAS --- */}
      {reviewStats && (
        <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg font-black text-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
              recommendationPercentage >= 70 ? 'bg-[#4ade80] text-black' : 
              recommendationPercentage >= 40 ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'
            }`}>
              {recommendationPercentage}%
            </div>
            <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Votos Positivos</span>
          </div>
          
          <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>
          
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold tracking-wider">
            <MessageSquare size={16} className="text-purple-500" />
            <span className="text-white">{reviewStats.totalReviews}</span> reseñas
          </div>
          
          <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>
          
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={16} fill="currentColor" />
            <span className="text-white font-bold ml-1 text-sm">{(reviewStats.averageRating || 0).toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* --- MENSAJE: OBTÉN EL JUEGO (NUEVO) --- */}
      {token && !userOwnsGame && !myReview && (
        <div className="bg-black/80 border border-purple-500/30 rounded-xl p-6 text-center shadow-lg mb-8 animate-in fade-in zoom-in duration-300">
           <Lock className="mx-auto text-purple-500 mb-3" size={32} />
           <p className="text-gray-300 font-sans text-sm mb-1">
             ¿Ya probaste el juego?
           </p>
           <p className="text-white font-bold text-sm uppercase tracking-wide">
             <span className="text-purple-400 border-b border-purple-400/50 pb-0.5">PASA UNA EXPERIENCIA</span> Y DANOS TU OPINION 😎
           </p>
        </div>
      )}

      {/* --- FORMULARIO DE RESEÑA (Solo si lo tienes) --- */}
      {token && userOwnsGame && (!myReview || editMode) && (
        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 border-2 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              {user?.username?.charAt(0).toUpperCase() || <User size={20}/>}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                 <Edit2 size={14} className="text-purple-400"/> 
                 {editMode ? 'EDITAR TU RESEÑA' : 'ESCRIBE TU OPINIÓN'}
              </h3>
              
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Comparte tu experiencia..."
                className="w-full bg-[#0a0a0a] text-gray-200 rounded-xl p-4 mb-4 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm min-h-[100px] transition-all placeholder:text-gray-600"
              />
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-500 font-bold mr-2">CALIFICACIÓN:</span>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      className={`p-1 transition-transform hover:scale-110 active:scale-95 ${reviewRating >= rating ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-gray-700'}`}
                    >
                      <Star size={20} fill={reviewRating >= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {editMode && (
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-gray-400 hover:text-white text-xs font-bold uppercase transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50 text-xs font-black uppercase tracking-widest shadow-[0_0_10px_rgba(147,51,234,0.3)] hover:shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                  >
                    {submittingReview ? <Loader2 className="animate-spin" size={16} /> : (editMode ? 'ACTUALIZAR' : 'PUBLICAR')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MI RESEÑA PUBLICADA --- */}
      {token && myReview && !editMode && (
        <div className="bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/30 rounded-2xl p-6 mb-8 relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-purple-400 shadow-lg">
                TÚ
              </div>
              <div>
                <p className="text-purple-300 font-bold text-sm tracking-wide">TU RESEÑA</p>
                <div className="flex text-yellow-400 text-xs mt-1">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} size={12} fill={i < myReview.rating ? "currentColor" : "none"} className={i < myReview.rating ? "" : "text-gray-700"} />
                   ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={startEdit} className="p-2 bg-black/50 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600 transition-all" title="Editar">
                  <Edit2 size={14}/>
              </button>
              <button onClick={handleDeleteReview} className="p-2 bg-black/50 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-900/30 transition-all" title="Eliminar">
                  <Trash2 size={14}/>
              </button>
            </div>
          </div>
          <p className="text-gray-200 text-sm italic leading-relaxed pl-2 border-l-2 border-purple-500/50">
            "{myReview.comment}"
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
             <span>Publicado el {new Date(myReview.createdAt).toLocaleDateString('es-ES')}</span>
             {myReview.helpful > 0 && <span className="text-purple-400">• {myReview.helpful} personas lo encontraron útil</span>}
          </div>
        </div>
      )}

      {/* --- LISTA DE RESEÑAS DE LA COMUNIDAD --- */}
      <div>
        <h3 className="text-sm md:text-base font-bold mb-6 border-b border-white/10 pb-3 uppercase tracking-wider text-gray-200"
            style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
            RESEÑAS DE LA COMUNIDAD
        </h3>

        {loadingReviews ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : reviews.length === 0 ? (
           <div className="text-center py-12 border border-white/5 rounded-2xl bg-black/20">
             <MessageSquare className="mx-auto text-gray-600 mb-3" size={32}/>
             <p className="text-gray-500 text-sm italic">Nadie ha opinado todavía.</p>
             {userOwnsGame && !myReview && <p className="text-purple-400 text-xs mt-1 font-bold">¡Sé el primero!</p>}
           </div>
        ) : (
          <div className="space-y-4">
            {reviews.filter(r => r.id !== myReview?.id).map((review) => (
              <div key={review.id} className="bg-black border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all shadow-md group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center text-gray-400 font-bold text-xs border border-white/10 group-hover:border-purple-500/50 transition-colors">
                      {review.username?.charAt(0).toUpperCase() || <User size={16}/>}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm tracking-wide">{review.username}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-800"} />
                            ))}
                         </div>
                         {review.rating >= 4 && (
                            <span className="text-[9px] text-[#4ade80] flex items-center gap-1 font-black uppercase tracking-wider bg-green-900/20 px-2 rounded">
                                <ThumbsUp size={10} /> Recomendado
                            </span>
                         )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 leading-relaxed pl-1">{review.comment}</p>
                
                <div className="flex items-center gap-4 border-t border-white/5 pt-3">
                  <button 
                    onClick={() => markReviewHelpful(review.id)}
                    disabled={!token}
                    className={`flex items-center gap-2 text-xs font-bold transition-colors px-3 py-1.5 rounded-lg ${
                       !token ? 'opacity-50 cursor-not-allowed text-gray-600' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span>¿Es útil? <span className="text-white ml-1">{review.helpful || 0}</span></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}