import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Eye, Send, Loader2, Plus, X, User, Image as ImageIcon, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';
import homeBg from '../assets/Astrogradiant.png';

// Función helper para construir la URL completa de las imágenes
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:8080${imageUrl}`;
  }
  
  if (imageUrl.startsWith('/')) {
    return `http://localhost:8080${imageUrl}`;
  }
  
  return `http://localhost:8080/uploads/${imageUrl}`;
};

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/community/posts?page=0&size=20');
      setPosts(response.data.content || response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!token) {
      toast.error('Debes iniciar sesión para dar like');
      return;
    }

    try {
      await axiosInstance.post(`/community/posts/${postId}/like`);
      loadPosts();
    } catch (error) {
      toast.error('Error al dar like');
    }
  };

  const handleViewPost = async (post) => {
    try {
      const response = await axiosInstance.get(`/community/posts/${post.id}`);
      setSelectedPost(response.data);
    } catch (error) {
      toast.error('Error al cargar el post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-orbitron pb-10 bg-cover bg-no-repeat"
         style={{ 
             backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${homeBg})`,
             backgroundPosition: 'center 0px'
         }}>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="py-10 text-center relative mb-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]"
              style={{ textShadow: "0px 0px 20px rgba(168, 85, 247, 0.6)" }}>
            COMUNIDAD
          </h1>
          <p className="text-gray-400 mt-2 font-sans tracking-widest text-sm uppercase">Comparte y descubre contenido</p>
          
          {token && (
            <div className="mt-6 flex justify-center">
                <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:scale-105 hover:shadow-[0_0_25px_rgba(147,51,234,0.8)]"
                >
                <Plus size={20} />
                NUEVO POST
                </button>
            </div>
          )}
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/5">
            <MessageSquare className="mx-auto text-gray-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">No hay posts aún</h2>
            <p className="text-gray-400">¡Sé el primero en publicar!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={handleLike}
                onView={handleViewPost}
                isLoggedIn={!!token}
              />
            ))}
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePostModal 
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              loadPosts();
            }}
          />
        )}

        {/* View Post Modal */}
        {selectedPost && (
          <ViewPostModal 
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onUpdate={loadPosts}
            isLoggedIn={!!token}
          />
        )}
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, onLike, onView, isLoggedIn }) {
  return (
    <div className="bg-[#0a0a0a]/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-300 shadow-lg group">
      
      {/* Header Autor */}
      <div className="p-6 pb-2 flex items-center gap-4">
          <div className="relative">
            {post.user?.avatarUrl ? (
                <img
                src={getImageUrl(post.user.avatarUrl)}
                alt={post.user.username || 'Usuario'}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
                />
            ) : null}
            <div 
                className={`w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center border-2 border-purple-500/50 ${post.user?.avatarUrl ? 'hidden' : ''}`}
                style={{ display: post.user?.avatarUrl ? 'none' : 'flex' }}
            >
                <User size={24} className="text-purple-300" />
            </div>
          </div>
          <div>
            <p className="font-bold text-white text-lg tracking-wide">{post.user?.username || 'Usuario'}</p>
            <p className="text-xs text-gray-400 font-sans">
                {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
      </div>

      {/* Content Text */}
      <div className="px-6 py-2">
         <h2 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors cursor-pointer" onClick={() => onView(post)}>
            {post.title}
         </h2>
         <p className="text-gray-300 font-sans leading-relaxed line-clamp-3 text-sm mb-4">
            {post.content}
         </p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full h-64 overflow-hidden cursor-pointer relative group-hover:opacity-100" onClick={() => onView(post)}>
            <img 
            src={getImageUrl(post.imageUrl)} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
                console.error('Error cargando imagen:', post.imageUrl);
                e.target.style.display = 'none';
            }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
        </div>
      )}

      {/* Stats & Actions */}
      <div className="px-6 py-4 flex items-center justify-between bg-black/40 border-t border-white/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onLike(post.id)}
            disabled={!isLoggedIn}
            className={`flex items-center gap-2 transition-all group/like ${
              post.isLikedByCurrentUser 
                ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.6)]' 
                : 'text-gray-400 hover:text-red-500'
            } ${!isLoggedIn && 'opacity-50 cursor-not-allowed'}`}
          >
            <Heart size={20} className={`transition-transform ${post.isLikedByCurrentUser ? 'fill-current scale-110' : 'group-hover/like:scale-110'}`} />
            <span className="font-bold text-sm">{post.likeCount || 0}</span>
          </button>

          <button 
             onClick={() => onView(post)}
             className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors group/comment"
          >
            <MessageSquare size={20} className="group-hover/comment:scale-110 transition-transform" />
            <span className="font-bold text-sm">{post.commentCount || 0}</span>
          </button>

          <div className="flex items-center gap-2 text-gray-500">
            <Eye size={20} />
            <span className="text-xs font-bold">{post.viewCount || 0}</span>
          </div>
        </div>

        <button
          onClick={() => onView(post)}
          className="text-purple-400 hover:text-white text-xs font-bold uppercase tracking-widest hover:underline transition-all"
        >
          LEER MÁS
        </button>
      </div>
    </div>
  );
}

// Create Post Modal (DARK MODE + SCROLLBAR PERSONALIZADO)
function CreatePostModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'El título es requerido';
    else if (title.trim().length < 5) newErrors.title = 'Mínimo 5 caracteres';
    
    if (!content.trim()) newErrors.content = 'El contenido es requerido';
    else if (content.trim().length < 10) newErrors.content = 'Mínimo 10 caracteres';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const postResponse = await axiosInstance.post('/community/posts', { 
        title: title.trim(), 
        content: content.trim() 
      });
      
      const postId = postResponse.data.id;

      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        await axiosInstance.post(
          `/community/posts/${postId}/media?mediaType=IMAGE`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      toast.success('¡Post creado exitosamente!');
      onCreated();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear el post';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-orbitron">
      {/* CAMBIO: Scrollbar personalizado forzado con clases arbitrarias de Tailwind */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-lg w-full p-6 max-h-[95vh] overflow-y-auto shadow-2xl text-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-500">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 sticky top-0 bg-[#1a1a1a] z-10">
          <h2 className="text-xl font-bold tracking-wider text-purple-400">NUEVO POST</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({...errors, title: null});
              }}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white focus:ring-2 focus:ring-purple-600 outline-none transition font-sans ${errors.title ? 'border-red-500' : 'border-white/10'}`}
              placeholder="¿De qué quieres hablar?"
              maxLength={200}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Contenido *</label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors({...errors, content: null});
              }}
              rows={5}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-white focus:ring-2 focus:ring-purple-600 outline-none resize-none transition font-sans ${errors.content ? 'border-red-500' : 'border-white/10'}`}
              placeholder="Escribe tu publicación..."
              maxLength={2000}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Imagen (opcional)</label>
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-2 text-purple-400" />
                  {/* CAMBIO: Todo el texto morado */}
                  <p className="text-xs font-bold text-purple-400">Click para subir o arrastra</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-white/10" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> PUBLICAR</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// View Post Modal (DARK MODE + SCROLLBAR PERSONALIZADO)
function ViewPostModal({ post, onClose, onUpdate, isLoggedIn }) {
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSending(true);
    try {
      await axiosInstance.post(`/community/posts/${post.id}/comments`, { content: comment.trim() });
      toast.success('Comentario agregado');
      setComment('');
      onUpdate();
      // Actualizar localmente si es necesario o esperar reload del padre
    } catch (error) {
      toast.error('Error al comentar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-orbitron">
      {/* CAMBIO: Scrollbar personalizado forzado */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl text-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-500">
        
        {/* Header Modal */}
        <div className="sticky top-0 bg-[#1a1a1a]/95 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold truncate pr-4 text-purple-300">{post.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition bg-white/5 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Author Info */}
          <div className="flex items-center gap-4 mb-6">
            {post.user?.avatarUrl ? (
              <img
                src={getImageUrl(post.user.avatarUrl)}
                alt={post.user.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
              />
            ) : (
                <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center border-2 border-purple-500/50">
                    <User size={24} className="text-purple-300" />
                </div>
            )}
            <div>
              <p className="font-bold text-lg">{post.user?.username}</p>
              <p className="text-xs text-gray-400 font-sans">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <img 
              src={getImageUrl(post.imageUrl)}
              alt={post.title}
              className="w-full rounded-xl mb-6 border border-white/10 shadow-lg"
            />
          )}

          {/* Content */}
          <div className="text-gray-300 whitespace-pre-wrap mb-8 font-sans leading-relaxed text-sm md:text-base bg-black/30 p-4 rounded-xl border border-white/5">
            {post.content}
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-gray-400 border-t border-white/10 pt-4 mb-6 font-bold">
            <span className="flex items-center gap-2"><Heart size={16} className="text-red-500" /> {post.likeCount} LIKES</span>
            <span className="flex items-center gap-2"><MessageSquare size={16} className="text-blue-400" /> {post.commentCount} COMENTARIOS</span>
            <span className="flex items-center gap-2"><Eye size={16} className="text-green-400" /> {post.viewCount} VISTAS</span>
          </div>

          {/* Comments Section */}
          <h3 className="font-bold mb-4 text-purple-400 border-b border-white/10 pb-2">COMENTARIOS</h3>
          
          {post.comments?.length > 0 ? (
            <div className="space-y-4 mb-8">
              {post.comments.map((c) => (
                <div key={c.id} className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    {c.user?.avatarUrl ? (
                      <img src={getImageUrl(c.user.avatarUrl)} alt="U" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                        <div className="w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center">
                             <User size={12} className="text-purple-300" />
                        </div>
                    )}
                    <span className="font-bold text-xs text-white">{c.user?.username}</span>
                    <span className="text-[10px] text-gray-500 font-sans">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-300 text-sm font-sans pl-8">{c.content}</p>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-gray-500 text-sm italic mb-8 text-center">Sé el primero en comentar.</p>
          )}

          {/* Add Comment Input */}
          {isLoggedIn ? (
            <form onSubmit={handleComment} className="flex gap-3 sticky bottom-0 bg-[#1a1a1a] pt-4 border-t border-white/10">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none font-sans text-sm"
                placeholder="Escribe un comentario..."
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={sending || !comment.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </form>
          ) : (
            <p className="text-center text-gray-500 text-xs bg-black/30 p-3 rounded-lg">Inicia sesión para participar en la discusión</p>
          )}
        </div>
      </div>
    </div>
  );
}