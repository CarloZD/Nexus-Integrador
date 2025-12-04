import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosConfig';
import { 
  Loader2, User, Mail, Calendar, Shield, 
  ShoppingBag, Heart, Edit2, Lock, Save, X, Upload, Camera, Gamepad2 
} from 'lucide-react';
import homeBg from '../assets/Astrogradiant.png';

export default function Profile() {
  const { getCurrentUser } = useAuth();
  const [currentUser] = useState(() => getCurrentUser());
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [libraryStats, setLibraryStats] = useState(null);
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
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `http://localhost:8080${imageUrl}`;
    if (imageUrl.startsWith('/')) return `http://localhost:8080${imageUrl}`;
    return `http://localhost:8080/uploads/${imageUrl}`;
  };

  useEffect(() => {
    loadProfile();
    loadFavorites();
    loadLibraryStats();
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

  const loadLibraryStats = async () => {
  try {
    const response = await axiosInstance.get('/library/stats');
    setLibraryStats(response.data);
  } catch (error) {
    console.error('Error loading library stats:', error);
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

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

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
      
      const user = JSON.parse(localStorage.getItem('user'));
      user.avatarUrl = response.data.avatarUrl;
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Error al subir la foto de perfil');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-orbitron">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error al cargar perfil</h2>
          <button onClick={() => window.location.href = '/'} className="text-purple-400 hover:text-purple-300 underline">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-orbitron pb-10 bg-cover bg-no-repeat"
         style={{ 
             backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${homeBg})`,
             backgroundPosition: 'center 0px'
         }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* --- HEADER DEL PERFIL --- */}
        <div className="bg-black rounded-[40px] shadow-2xl overflow-hidden pb-8">
          {/* Banner decorativo con gradiente */}
          <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-black h-64 relative">
             <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="-mt-28 px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              
              {/* Avatar y Datos */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full shadow-2xl overflow-hidden flex items-center justify-center transition-colors">
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
                      className={`w-full h-full flex items-center justify-center bg-purple-900/20 ${profile.avatarUrl ? 'hidden' : ''}`}
                      style={{ display: profile.avatarUrl ? 'none' : 'flex' }}
                    >
                      <User className="text-purple-600" size={64} />
                    </div>
                  </div>
                  
                  {/* Overlay para subir foto */}
                  <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all border-4 border-transparent">
                    {uploadingAvatar ? (
                      <Loader2 className="animate-spin text-white" size={32} />
                    ) : (
                      <div className="text-center">
                          <Camera className="text-white mx-auto mb-0" size={24} />
                          <span className="text-[12px] uppercase font-bold">Cambiar</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                  </label>
                </div>

                  <div className="text-center sm:text-left mb-15">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-wide uppercase drop-shadow-md">
                    {profile.fullName}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-14">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      profile.role === 'ADMIN' 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-blue-500/20 border-blue-500 text-blue-300'
                    }`}>
                      {profile.role === 'ADMIN' ? 'Administrador' : 'Gamer'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-sans">
                      <Calendar size={14} />
                      Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pb-0 relative top-[11px]">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold text-xs uppercase tracking-wider hover:text-purple-600 hover:border-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
                <button
                  onClick={() => setChangePasswordMode(!changePasswordMode)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold text-xs uppercase tracking-wider hover:text-purple-600 hover:border-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- FORMULARIO DE EDICIÓN (MODO OSCURO) --- */}
        {editMode && (
          <div className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 p-6 animate-in fade-in slide-in-from-top-4">
              <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider">Editar Información</h2>
              <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Usuario</label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({...editData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none transition font-sans text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Nombre Completo</label>
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none transition font-sans text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold uppercase text-xs hover:bg-purple-500 transition flex items-center justify-center gap-2 shadow-lg">
                  <Save size={16} /> Guardar
                </button>
                <button type="button" onClick={() => setEditMode(false)} className="flex-1 bg-white/5 text-gray-300 py-3 rounded-lg font-bold uppercase text-xs hover:bg-white/10 transition border border-white/10">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- FORMULARIO CAMBIAR PASSWORD (MODO OSCURO) --- */}
        {changePasswordMode && (
          <div className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-purple-400 uppercase tracking-wider">Cambiar Contraseña</h2>
              <button onClick={() => setChangePasswordMode(false)} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none transition font-sans text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Nueva Contraseña</label>
                   <input
                     type="password"
                     value={passwordData.newPassword}
                     onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                     className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none transition font-sans text-sm"
                     required minLength={6}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Confirmar</label>
                   <input
                     type="password"
                     value={passwordData.confirmPassword}
                     onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                     className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none transition font-sans text-sm"
                     required
                   />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold uppercase text-xs hover:bg-purple-500 transition flex items-center justify-center gap-2 shadow-lg">
                  <Lock size={16} /> Actualizar
                </button>
                <button type="button" onClick={() => setChangePasswordMode(false)} className="flex-1 bg-white/5 text-gray-300 py-3 rounded-lg font-bold uppercase text-xs hover:bg-white/10 transition border border-white/10">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- STATS GRID --- */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center hover:border-blue-500/30 transition-all shadow-lg group">
            <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
               <ShoppingBag className="text-blue-400" size={24} />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: '"Press Start 2P", cursive' }}>Biblioteca</p>
            <p className="text-2xl font-black text-white drop-shadow-md">
              {libraryStats ? `${libraryStats.totalGames} Juegos` : 'Cargando...'}
            </p>
          </div>

          <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center hover:border-green-500/30 transition-all shadow-lg group">
            <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
               <Shield className="text-green-400" size={24} />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: '"Press Start 2P", cursive' }}>Estado</p>
            <p className="text-2xl font-black text-white drop-shadow-md">ACTIVO</p>
          </div>
        </div>

        {/* --- FAVORITES SECTION --- */}
        <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-3xl border border-white/5 p-8">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 border-b border-white/10 pb-4" style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
            <Heart className="text-red-500" size={24} fill="currentColor" />
            MIS FAVORITOS ({favorites.length})
          </h2>
          
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400 font-sans text-sm">Aún no tienes juegos favoritos en tu colección.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-purple-500 transition shadow-lg"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((game) => (
                <div key={game.id} className="bg-black rounded-xl overflow-hidden group border border-white/10 hover:border-purple-500 transition-all shadow-lg hover:-translate-y-1 cursor-pointer"
                     onClick={() => window.location.href = `/game/${game.id}`}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={game.headerImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all"></div>
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         removeFavorite(game.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition shadow-lg"
                      title="Eliminar de favoritos"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 truncate tracking-wide">{game.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-black text-[#4ade80] drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                        ${parseFloat(game.price).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-purple-300 font-bold uppercase hover:underline">
                        Ver detalles
                      </span>
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