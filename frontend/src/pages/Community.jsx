import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Eye, Send, Loader2, Plus, X, User } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';

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
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
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
              className={`flex items-center gap-2 transition ${
                post.isLikedByCurrentUser 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
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

// Create Post Modal
function CreatePostModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/community/posts', { title, content });
      toast.success('¡Post creado!');
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nuevo Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="¿De qué quieres hablar?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Escribe tu publicación..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            Publicar
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
    if (!comment.trim()) return;

    setSending(true);
    try {
      await axiosInstance.post(`/community/posts/${post.id}/comments`, { content: comment });
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">{post.user?.username}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

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
          {isLoggedIn && (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Escribe un comentario..."
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

