import { useState, useEffect } from 'react';
import { 
  Users, Package, Activity, Shield, Loader2, 
  Edit, Trash2, ToggleLeft, ToggleRight, 
  Search, Filter, ChevronLeft, ChevronRight,
  Gamepad2, MessageSquare, FileText, Plus, X
} from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [posts, setPosts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  
  // Contadores para las pestañas (se mantienen aunque no esté activa la pestaña)
  const [counts, setCounts] = useState({ users: 0, games: 0, posts: 0 });

  // Cargar contadores siempre
  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, activeTab]);

  // Cargar contadores de todas las secciones
  const loadCounts = async () => {
    try {
      const [statsRes, gamesRes, postsRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/games'),
        axiosInstance.get('/admin/posts?page=0&size=100') // Obtener suficientes para contar
      ]);
      
      // Contar solo posts activos
      let activePostsCount = 0;
      if (postsRes.data.content) {
        activePostsCount = postsRes.data.content.filter(post => post.active !== false).length;
        // Si hay más páginas, usar totalElements como aproximación (pero filtrar los de la primera página)
        // Por ahora, solo contamos los de la primera página
      } else if (Array.isArray(postsRes.data)) {
        activePostsCount = postsRes.data.filter(post => post.active !== false).length;
      }
      
      setCounts({
        users: statsRes.data.totalUsers || 0,
        games: gamesRes.data.length || 0,
        posts: activePostsCount
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const promises = [axiosInstance.get('/admin/stats')];
      
      if (activeTab === 'users') {
        promises.push(axiosInstance.get(`/admin/users?page=${currentPage}&size=${pageSize}`));
      } else if (activeTab === 'games') {
        promises.push(axiosInstance.get('/admin/games'));
      } else if (activeTab === 'posts') {
        promises.push(axiosInstance.get(`/admin/posts?page=${currentPage}&size=${pageSize}`));
      } else if (activeTab === 'audit') {
        promises.push(axiosInstance.get('/admin/audit-logs?limit=100'));
      }

      const results = await Promise.all(promises);
      setStats(results[0].data);

      if (activeTab === 'users') {
        const usersRes = results[1];
        if (usersRes.data.content) {
          setUsers(usersRes.data.content);
          setTotalPages(usersRes.data.totalPages);
          setCounts(prev => ({ ...prev, users: usersRes.data.totalElements }));
        } else {
          setUsers(usersRes.data);
          setCounts(prev => ({ ...prev, users: usersRes.data.length }));
        }
      } else if (activeTab === 'games') {
        setGames(results[1].data);
        setCounts(prev => ({ ...prev, games: results[1].data.length }));
      } else if (activeTab === 'posts') {
        const postsRes = results[1];
        if (postsRes.data.content) {
          // Filtrar posts inactivos (solo mostrar activos)
          const activePosts = postsRes.data.content.filter(post => post.active !== false);
          setPosts(activePosts);
          setTotalPages(postsRes.data.totalPages);
          // Actualizar contador con solo posts activos
          setCounts(prev => ({ ...prev, posts: activePosts.length }));
        } else {
          // Filtrar posts inactivos
          const activePosts = Array.isArray(postsRes.data) 
            ? postsRes.data.filter(post => post.active !== false)
            : [];
          setPosts(activePosts);
          setCounts(prev => ({ ...prev, posts: activePosts.length }));
        }
      } else if (activeTab === 'audit') {
        setAuditLogs(results[1].data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error al cargar datos de administración');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/users/search?q=${searchQuery}`);
      setUsers(response.data);
      setTotalPages(0);
    } catch (error) {
      toast.error('Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/toggle-status`);
      toast.success('Estado del usuario actualizado');
      await loadData();
      await loadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar el usuario');
    }
  };

  const changeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    
    if (!window.confirm(`¿Cambiar rol a ${newRole}?`)) return;

    try {
      await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Rol actualizado correctamente');
      await loadData();
      await loadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar rol');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado');
      // Recargar datos y contadores
      await loadData();
      await loadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar el usuario');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona usuarios, estadísticas y configuración del sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats?.activeUsers || 0} activos
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Users className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.adminUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Con permisos completos</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Shield className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Regulares</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.regularUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Usuarios estándar</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Inactivos</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.inactiveUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Desactivados</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <Activity className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vista General
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Usuarios ({counts.users})
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'games'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Juegos ({counts.games})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Posts ({counts.posts})
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'audit'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Auditoría
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del Sistema</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total de usuarios registrados</span>
                <span className="font-bold text-primary-600 text-xl">{stats?.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Usuarios activos</span>
                <span className="font-bold text-green-600 text-xl">{stats?.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Administradores</span>
                <span className="font-bold text-purple-600 text-xl">{stats?.adminUsers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Usuarios regulares</span>
                <span className="font-bold text-blue-600 text-xl">{stats?.regularUsers}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                    placeholder="Buscar por email, username o nombre..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={searchUsers}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Buscar
                </button>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      loadData();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.fullName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => changeUserRole(user.id, user.role)}
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            title="Clic para cambiar rol"
                          >
                            {user.role}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                              title={user.active ? 'Desactivar' : 'Activar'}
                            >
                              {user.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                              title="Eliminar"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Página {currentPage + 1} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <GamesTab 
            games={games} 
            onRefresh={loadData}
            onEdit={(game) => {
              setEditingGame(game);
              setShowGameModal(true);
            }}
            onToggleActive={async (gameId, currentActive) => {
              try {
                await axiosInstance.put(`/admin/games/${gameId}`, { active: !currentActive });
                toast.success(`Juego ${!currentActive ? 'activado' : 'ocultado'}`);
                await loadData();
                await loadCounts();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error al actualizar el juego');
              }
            }}
            onDelete={async (gameId) => {
              if (!window.confirm('¿Estás seguro de ocultar este juego? (Se ocultará pero no se eliminará)')) return;
              try {
                await axiosInstance.put(`/admin/games/${gameId}`, { active: false });
                toast.success('Juego ocultado');
                await loadData();
                await loadCounts();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error al ocultar el juego');
              }
            }}
            onCreate={() => {
              setEditingGame(null);
              setShowGameModal(true);
            }}
          />
        )}

        {/* Modal para crear/editar juegos */}
        {showGameModal && (
          <GameModal
            game={editingGame}
            onClose={() => {
              setShowGameModal(false);
              setEditingGame(null);
            }}
            onSave={async () => {
              await loadData();
              await loadCounts();
              setShowGameModal(false);
              setEditingGame(null);
            }}
          />
        )}

        {activeTab === 'posts' && (
          <PostsTab 
            posts={posts}
            onRefresh={loadData}
            onDelete={async (postId) => {
              if (!window.confirm('¿Estás seguro de eliminar este post?')) return;
              try {
                await axiosInstance.delete(`/admin/posts/${postId}`);
                toast.success('Post eliminado');
                // Actualizar contador inmediatamente
                setCounts(prev => ({ ...prev, posts: Math.max(0, prev.posts - 1) }));
                // Remover el post de la lista localmente
                setPosts(prev => prev.filter(post => post.id !== postId));
                // Recargar datos para asegurar sincronización
                await loadData();
                await loadCounts();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error al eliminar el post');
              }
            }}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTab logs={auditLogs} />
        )}
      </div>
    </div>
  );
}

// Componente para la pestaña de Juegos
function GamesTab({ games, onRefresh, onEdit, onDelete, onCreate, onToggleActive }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestión de Juegos</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Juego
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{game.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${game.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      game.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {game.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(game)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onToggleActive(game.id, game.active)}
                        className={`p-2 rounded transition ${
                          game.active 
                            ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={game.active ? 'Ocultar' : 'Mostrar'}
                      >
                        {game.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => onDelete(game.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                        title="Ocultar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente para la pestaña de Posts
function PostsTab({ posts, onRefresh, onDelete }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Gestión de Posts</h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Likes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{post.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.user?.username || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.likeCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {post.active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onDelete(post.id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente para la pestaña de Auditoría
function AuditTab({ logs }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Logs de Auditoría</h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.userId || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-md">{log.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente Modal para crear/editar juegos
function GameModal({ game, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: game?.title || '',
    steamAppId: game?.steamAppId || '',
    shortDescription: game?.shortDescription || '',
    description: game?.description || '',
    price: game?.price || 0,
    category: game?.category || 'ACTION',
    platform: game?.platform || 'PC',
    rating: game?.rating || 0,
    imageUrl: game?.imageUrl || '',
    coverImageUrl: game?.coverImageUrl || '',
    featured: game?.featured || false,
    developer: game?.developer || '',
    publisher: game?.publisher || '',
    releaseDate: game?.releaseDate || '',
    genres: game?.genres || '',
    isFree: game?.isFree || false,
    stock: game?.stock || 0,
    active: game?.active !== undefined ? game.active : true
  });
  const [loading, setLoading] = useState(false);

  const categories = ['ACTION', 'ADVENTURE', 'RPG', 'STRATEGY', 'SPORTS', 'SIMULATION', 'RACING', 'PUZZLE', 'HORROR', 'INDIE'];
  const platforms = ['PC', 'PS5', 'XBOX', 'NINTENDO_SWITCH', 'MULTI'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (game) {
        // Actualizar juego existente
        await axiosInstance.put(`/admin/games/${game.id}`, formData);
        toast.success('Juego actualizado exitosamente');
      } else {
        // Crear nuevo juego
        await axiosInstance.post('/admin/games', formData);
        toast.success('Juego creado exitosamente');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el juego');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFetchSteamData = async () => {
    if (!formData.steamAppId) {
      toast.error('Por favor ingresa un Steam App ID');
      return;
    }

    setLoading(true);
    try {
      // Intentar obtener datos de Steam usando el App ID
      // Nota: Esto requiere una API de Steam o usar un servicio proxy
      // Por ahora, solo pre-llenamos las URLs de imagen comunes
      const appId = formData.steamAppId;
      
      // URLs comunes de Steam para imágenes
      const headerImage = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
      const coverImage = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
      
      setFormData(prev => ({
        ...prev,
        imageUrl: headerImage,
        coverImageUrl: coverImage,
        headerImage: headerImage
      }));
      
      toast.success('URLs de imagen pre-llenadas. Verifica que funcionen correctamente.');
    } catch (error) {
      console.error('Error fetching Steam data:', error);
      toast.error('No se pudo obtener información automática. Completa los campos manualmente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {game ? 'Editar Juego' : 'Nuevo Juego'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Steam App ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="steamAppId"
                  value={formData.steamAppId}
                  onChange={handleChange}
                  required={!game}
                  disabled={!!game}
                  placeholder="Ej: 730 (CS:GO), 271590 (GTA V)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
                {!game && (
                  <button
                    type="button"
                    onClick={handleFetchSteamData}
                    disabled={!formData.steamAppId || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    title="Buscar información del juego en Steam"
                  >
                    Buscar
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                💡 Encuentra el Steam App ID en la URL de Steam: store.steampowered.com/app/<strong>NUMERO</strong>/
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataforma
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {platforms.map(plat => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desarrollador
              </label>
              <input
                type="text"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Editor
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Lanzamiento
              </label>
              <input
                type="text"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                placeholder="YYYY-MM-DD"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Imagen (Header/Cover)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                💡 Usa imágenes de Steam: cdn.akamai.steamstatic.com/steam/apps/<strong>APP_ID</strong>/header.jpg
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Imagen de Portada (Opcional)
              </label>
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://cdn.akamai.steamstatic.com/steam/apps/730/library_600x900.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Corta
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Destacado</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Gratis</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Activo</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (game ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}