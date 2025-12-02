import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosConfig';
import { 
  Loader2, User, Mail, Calendar, Shield, 
  ShoppingBag, Heart, Edit2, Lock, Save, X, Upload, Camera 
} from 'lucide-react';

export default function Profile() {
  const { getCurrentUser } = useAuth();
  const [currentUser] = useState(() => getCurrentUser());
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    fullName: ''
  });
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  useEffect(() => {
    loadProfile();
    loadFavorites();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/profile');
      setProfile(response.data);
      setEditData({
        username: response.data.username,
        fullName: response.data.fullName
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await axiosInstance.get('/user/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!editData.username || !editData.fullName) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      const response = await axiosInstance.put('/profile', editData);
      setProfile(response.data);
      
      // Actualizar localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.username = response.data.username;
      user.fullName = response.data.fullName;
      user.avatarUrl = response.data.avatarUrl;
      localStorage.setItem('user', JSON.stringify(user));
      
      setEditMode(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await axiosInstance.put('/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setChangePasswordMode(false);
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const removeFavorite = async (gameId) => {
    try {
      await axiosInstance.delete(`/user/favorites/${gameId}`);
      setFavorites(favorites.filter(fav => fav.id !== gameId));
      toast.success('Eliminado de favoritos');
    } catch (error) {
      toast.error('Error al eliminar favorito');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
      
      // Actualizar localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.avatarUrl = response.data.avatarUrl;
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Error al subir la foto de perfil');
    } finally {
      setUploadingAvatar(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error al cargar perfil
          </h2>
          <button
            onClick={() => window.location.href = '/'}
            className="text-primary-600 hover:text-primary-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-32" />
          <div className="-mt-16 px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-white shadow-lg overflow-hidden flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <img
                        src={getImageUrl(profile.avatarUrl)}
                        alt={profile.fullName || profile.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex items-center justify-center ${profile.avatarUrl ? 'hidden' : ''}`}
                      style={{ display: profile.avatarUrl ? 'none' : 'flex' }}
                    >
                      <User className="text-primary-600" size={40} />
                    </div>
                  </div>
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center cursor-pointer transition-opacity">
                    {uploadingAvatar ? (
                      <Loader2 className="animate-spin text-white" size={24} />
                    ) : (
                      <Camera className="text-white" size={24} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.fullName}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Mail size={16} className="text-primary-500" />
                    {profile.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      profile.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Editar perfil
                </button>
                <button
                  onClick={() => setChangePasswordMode(!changePasswordMode)}
                  className="px-6 py-3 border border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-gray-300 transition flex items-center gap-2"
                >
                  <Lock size={18} />
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editMode && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Editar Información</h2>
              <button
                onClick={() => setEditMode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({...editData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Change Password Form */}
        {changePasswordMode && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h2>
              <button
                onClick={() => setChangePasswordMode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  Cambiar contraseña
                </button>
                <button
                  type="button"
                  onClick={() => setChangePasswordMode(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Juegos en biblioteca</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favoritos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{favorites.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <Heart className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-3xl font-bold text-green-600 mt-1">Activo</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Shield className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mis Favoritos ({favorites.length})
          </h2>
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Aún no tienes juegos favoritos</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Explorar juegos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((game) => (
                <div key={game.id} className="bg-gray-50 rounded-xl overflow-hidden group hover:shadow-lg transition">
                  <div className="relative h-40">
                    <img
                      src={game.headerImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeFavorite(game.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{game.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-600">
                        ${parseFloat(game.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => window.location.href = `/game/${game.id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}