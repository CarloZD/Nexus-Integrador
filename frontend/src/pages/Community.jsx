import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Eye, Send, Loader2, Plus, X, User, Image as ImageIcon, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';

// Función helper para construir la URL completa de las imágenes
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Si ya es una URL completa (http:// o https://), devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si es una ruta relativa que empieza con /uploads/, construir la URL completa
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:8080${imageUrl}`;
  }
  
  // Si es una ruta relativa sin /uploads/, también construir la URL completa
  if (imageUrl.startsWith('/')) {
    return `http://localhost:8080${imageUrl}`;
  }
  
  // Si no empieza con /, asumir que es relativa a /uploads/
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comunidad</h1>
            <p className="text-gray-600">Comparte y descubre contenido</p>
          </div>
          {token && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Post
            </button>
          )}
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No hay posts aún</h2>
            <p className="text-gray-600">¡Sé el primero en publicar!</p>
          </div>
        ) : (
          <div className="space-y-6">
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      {post.imageUrl && (
        <img 
          src={getImageUrl(post.imageUrl)} 
          alt={post.title}
          className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition"
          onClick={() => onView(post)}
          onError={(e) => {
            console.error('Error cargando imagen:', post.imageUrl);
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="p-6">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          {post.user?.avatarUrl ? (
            <img
              src={getImageUrl(post.user.avatarUrl)}
              alt={post.user.username || 'Usuario'}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center ${post.user?.avatarUrl ? 'hidden' : ''}`}
            style={{ display: post.user?.avatarUrl ? 'none' : 'flex' }}
          >
            <User size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.user?.username || 'Usuario'}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onLike(post.id)}
              disabled={!isLoggedIn}
              className={`flex items-center gap-2 transition ${
                post.isLikedByCurrentUser 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              } ${!isLoggedIn && 'opacity-50 cursor-not-allowed'}`}
            >
              <Heart size={20} fill={post.isLikedByCurrentUser ? 'currentColor' : 'none'} />
              <span>{post.likeCount || 0}</span>
            </button>
            <span className="flex items-center gap-2 text-gray-500">
              <MessageSquare size={20} />
              {post.commentCount || 0}
            </span>
            <span className="flex items-center gap-2 text-gray-500">
              <Eye size={20} />
              {post.viewCount || 0}
            </span>
          </div>
          <button
            onClick={() => onView(post)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Post Modal - CON SOPORTE PARA IMÁGENES
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
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }

      console.log('✅ Imagen seleccionada:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      setImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (title.trim().length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }
    
    if (!content.trim()) {
      newErrors.content = 'El contenido es requerido';
    } else if (content.trim().length < 10) {
      newErrors.content = 'El contenido debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 1. Crear el post primero (sin imagen)
      console.log('📝 Creando post...');
      const postResponse = await axiosInstance.post('/community/posts', { 
        title: title.trim(), 
        content: content.trim() 
      });
      
      console.log('✅ Post creado:', postResponse.data);
      const postId = postResponse.data.id;

      // 2. Si hay imagen, subirla después
      if (image) {
        console.log('📸 Subiendo imagen para post:', postId);
        
        const formData = new FormData();
        formData.append('file', image);

        // Log para verificar
        console.log('FormData creado:', {
          file: image.name,
          type: image.type,
          size: image.size
        });

        const uploadResponse = await axiosInstance.post(
          `/community/posts/${postId}/media?mediaType=IMAGE`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log('✅ Imagen subida:', uploadResponse.data);
      }

      toast.success('¡Post creado exitosamente!');
      onCreated();
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al crear el post';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nuevo Post</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors({...errors, title: null});
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="¿De qué quieres hablar?"
              maxLength={200}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/200 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido *
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) {
                  setErrors({...errors, content: null});
                }
              }}
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Escribe tu publicación..."
              maxLength={2000}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/2000 caracteres
            </p>
          </div>

          {/* Sección de imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen (opcional)
            </label>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click para subir</span> o arrastra una imagen
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Publicando...
              </>
            ) : (
              <>
                <Send size={20} />
                Publicar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
// View Post Modal
function ViewPostModal({ post, onClose, onUpdate, isLoggedIn }) {
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    setSending(true);
    try {
      await axiosInstance.post(`/community/posts/${post.id}/comments`, { 
        content: comment.trim() 
      });
      toast.success('Comentario agregado');
      setComment('');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Error al comentar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            {post.user?.avatarUrl ? (
              <img
                src={getImageUrl(post.user.avatarUrl)}
                alt={post.user.username || 'Usuario'}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center ${post.user?.avatarUrl ? 'hidden' : ''}`}
              style={{ display: post.user?.avatarUrl ? 'none' : 'flex' }}
            >
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">{post.user?.username}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <img 
              src={getImageUrl(post.imageUrl)}
              alt={post.title}
              className="w-full rounded-lg mb-4"
              onError={(e) => {
                console.error('Error cargando imagen:', post.imageUrl);
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Content */}
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{post.content}</p>

          {/* Stats */}
          <div className="flex gap-6 text-gray-500 text-sm mb-6 pb-6 border-b">
            <span>{post.likeCount} likes</span>
            <span>{post.commentCount} comentarios</span>
            <span>{post.viewCount} vistas</span>
          </div>

          {/* Comments */}
          <h3 className="font-bold mb-4">Comentarios</h3>
          
          {post.comments?.length > 0 ? (
            <div className="space-y-4 mb-6">
              {post.comments.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {c.user?.avatarUrl ? (
                      <img
                        src={getImageUrl(c.user.avatarUrl)}
                        alt={c.user.username || 'Usuario'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ${c.user?.avatarUrl ? 'hidden' : ''}`}
                      style={{ display: c.user?.avatarUrl ? 'none' : 'flex' }}
                    >
                      <User size={16} className="text-primary-600" />
                    </div>
                    <span className="font-semibold text-sm">{c.user?.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-6">No hay comentarios aún</p>
          )}

          {/* Add Comment */}
          {isLoggedIn ? (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Escribe un comentario..."
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={sending || !comment.trim()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </form>
          ) : (
            <p className="text-center text-gray-500 text-sm">
              Debes iniciar sesión para comentar
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 


