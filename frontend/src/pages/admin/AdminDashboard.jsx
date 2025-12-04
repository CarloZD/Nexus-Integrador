import { useState, useEffect } from 'react';
import { 
  Users, Package, Activity, Shield, Loader2, 
  Edit, Trash2, ToggleLeft, ToggleRight, 
  Search, ChevronLeft, ChevronRight,
  Gamepad2, MessageSquare, FileText, Plus, X
} from 'lucide-react';
// CORRECCIÓN: Subir dos niveles (../../) para llegar a 'api' y 'assets'
import axiosInstance from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import homeBg from '../../assets/Astrogradiant.png';

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
  
  // Contadores
  const [counts, setCounts] = useState({ users: 0, games: 0, posts: 0 });

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, activeTab]);

  const loadCounts = async () => {
    try {
      const [statsRes, gamesRes, postsRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/games'),
        axiosInstance.get('/admin/posts?page=0&size=100')
      ]);
      
      let activePostsCount = 0;
      if (postsRes.data.content) {
        activePostsCount = postsRes.data.content.filter(post => post.active !== false).length;
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
          // setCounts se actualiza en loadCounts para mantener consistencia global
        } else {
          setUsers(usersRes.data);
        }
      } else if (activeTab === 'games') {
        setGames(results[1].data);
      } else if (activeTab === 'posts') {
        const postsRes = results[1];
        const activePosts = (postsRes.data.content || postsRes.data).filter(post => post.active !== false);
        setPosts(activePosts);
        if (postsRes.data.totalPages) setTotalPages(postsRes.data.totalPages);
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
      toast.success('Estado actualizado');
      await loadData();
      await loadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const changeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`¿Cambiar rol a ${newRole}?`)) return;

    try {
      await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Rol actualizado');
      await loadData();
      await loadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar rol');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro? Esta acción es irreversible.')) return;
    
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado');
      await loadData();
      await loadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
        <p className="text-white font-orbitron text-sm mt-4 tracking-wider animate-pulse">CARGANDO SISTEMA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-orbitron pb-10 bg-cover bg-no-repeat bg-fixed"
         style={{ 
             backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url(${homeBg})`,
             backgroundPosition: 'center 0px'
         }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] mb-2"
              style={{ textShadow: "0px 0px 20px rgba(168, 85, 247, 0.6)" }}>
            PANEL DE CONTROL
          </h1>
          <p className="text-gray-400 text-xs font-sans tracking-wider uppercase">Administración del sistema Nexus</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard 
            title="TOTAL USUARIOS" 
            value={stats?.totalUsers || 0} 
            subValue={`${stats?.activeUsers || 0} activos`}
            icon={<Users className="text-purple-400" size={24} />}
            color="purple"
          />
          <StatsCard 
            title="ADMINISTRADORES" 
            value={stats?.adminUsers || 0} 
            subValue="Acceso total"
            icon={<Shield className="text-yellow-400" size={24} />}
            color="yellow"
          />
          <StatsCard 
            title="REGULARES" 
            value={stats?.regularUsers || 0} 
            subValue="Usuarios estándar"
            icon={<Package className="text-blue-400" size={24} />}
            color="blue"
          />
          <StatsCard 
            title="INACTIVOS" 
            value={stats?.inactiveUsers || 0} 
            subValue="Cuentas deshabilitadas"
            icon={<Activity className="text-red-400" size={24} />}
            color="red"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-2 mb-8 overflow-x-auto no-scrollbar">
           <div className="flex space-x-2 min-w-max">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={16}/>}>Vista General</TabButton>
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16}/>} count={counts.users}>Usuarios</TabButton>
              <TabButton active={activeTab === 'games'} onClick={() => setActiveTab('games')} icon={<Gamepad2 size={16}/>} count={counts.games}>Juegos</TabButton>
              <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<MessageSquare size={16}/>} count={counts.posts}>Posts</TabButton>
              <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<FileText size={16}/>}>Auditoría</TabButton>
           </div>
        </div>

        {/* Content Area */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl min-h-[500px]">
            
            {activeTab === 'overview' && (
               <div className="text-center py-20">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 animate-pulse">
                      <Shield className="text-purple-500" size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Bienvenido Administrador</h2>
                  <p className="text-gray-400 max-w-md mx-auto font-sans">
                      Selecciona una pestaña para gestionar los recursos de la plataforma. 
                      Puedes administrar usuarios, catálogo de juegos, moderar la comunidad y ver registros de actividad.
                  </p>
               </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in">
                    {/* Search */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                                placeholder="BUSCAR USUARIO..." 
                                className="w-full bg-[#151515] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all font-sans placeholder-gray-600"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        </div>
                        <button onClick={searchUsers} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-lg">
                            Buscar
                        </button>
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); loadData(); }} className="border border-white/20 text-gray-300 hover:text-white px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all">
                                Limpiar
                            </button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Usuario</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Rol</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm font-sans text-gray-300">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{u.username}</td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => changeUserRole(u.id, u.role)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase border transition-all ${
                                                    u.role === 'ADMIN' 
                                                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 hover:bg-purple-500/30' 
                                                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400'
                                                }`}
                                                title="Click para cambiar rol"
                                            >
                                                {u.role}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                u.active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {u.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => toggleUserStatus(u.id)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors" title={u.active ? "Desactivar" : "Activar"}>
                                                {u.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                            </button>
                                            <button onClick={() => deleteUser(u.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors" title="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-500 font-sans">Página {currentPage + 1} de {totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-white">
                                    <ChevronLeft size={18} />
                                </button>
                                <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-white">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'games' && (
                <GamesTab 
                    games={games} 
                    onRefresh={loadData}
                    onEdit={(game) => { setEditingGame(game); setShowGameModal(true); }}
                    onToggleActive={async (gameId, currentActive) => {
                        try {
                            await axiosInstance.put(`/admin/games/${gameId}`, { active: !currentActive });
                            toast.success(`Juego ${!currentActive ? 'activado' : 'ocultado'}`);
                            await loadData();
                            await loadCounts();
                        } catch (error) { toast.error('Error al actualizar'); }
                    }}
                    onDelete={async (gameId) => {
                         if (!window.confirm('¿Ocultar este juego?')) return;
                         try {
                             await axiosInstance.put(`/admin/games/${gameId}`, { active: false });
                             toast.success('Juego ocultado');
                             await loadData();
                         } catch (error) { toast.error('Error al ocultar'); }
                    }}
                    onCreate={() => { setEditingGame(null); setShowGameModal(true); }}
                />
            )}

            {/* Modal Juegos */}
            {showGameModal && (
                <GameModal 
                    game={editingGame} 
                    onClose={() => { setShowGameModal(false); setEditingGame(null); }}
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
                    onDelete={async (postId) => {
                        if (!window.confirm('¿Eliminar post permanentemente?')) return;
                        try {
                            await axiosInstance.delete(`/admin/posts/${postId}`);
                            toast.success('Post eliminado');
                            setPosts(prev => prev.filter(p => p.id !== postId));
                            setCounts(prev => ({...prev, posts: Math.max(0, prev.posts - 1)}));
                        } catch(e) { toast.error('Error al eliminar'); }
                    }}
                />
            )}

            {activeTab === 'audit' && <AuditTab logs={auditLogs} />}

        </div>

      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ESTILIZADOS ---

function StatsCard({ title, value, subValue, icon, color }) {
    const colorClasses = {
        purple: 'text-purple-400 border-purple-500/30 bg-purple-900/20',
        yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20',
        blue: 'text-blue-400 border-blue-500/30 bg-blue-900/20',
        red: 'text-red-400 border-red-500/30 bg-red-900/20',
    };

    return (
        <div className={`rounded-2xl p-6 border backdrop-blur-sm transition-transform hover:-translate-y-1 ${colorClasses[color]} border-opacity-50`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">{title}</p>
                    <p className="text-3xl font-black mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-black/20 ${colorClasses[color].split(' ')[0]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-[10px] opacity-60 font-sans uppercase tracking-wide">{subValue}</p>
        </div>
    );
}

function TabButton({ active, onClick, icon, children, count }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                active 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
            {icon}
            <span>{children}</span>
            {count !== undefined && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] ${active ? 'bg-white/20' : 'bg-white/10'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function GamesTab({ games, onEdit, onToggleActive, onDelete, onCreate }) {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Catálogo de Juegos</h3>
                <button onClick={onCreate} className="bg-green-600 hover:bg-green-500 text-black px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all">
                    <Plus size={18} /> Nuevo Juego
                </button>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-xs uppercase text-gray-400 font-bold tracking-wider">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Título</th>
                            <th className="p-4">Precio</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-sans text-gray-300">
                        {games.map((game) => (
                            <tr key={game.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-gray-500">#{game.id}</td>
                                <td className="p-4 font-bold text-white">{game.title}</td>
                                <td className="p-4 text-[#4ade80] font-bold">S/. {game.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${game.active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {game.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => onEdit(game)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition" title="Editar"><Edit size={18}/></button>
                                    <button onClick={() => onToggleActive(game.id, game.active)} className="p-2 hover:bg-white/10 rounded-lg text-yellow-400 transition" title="Visibilidad"><ToggleRight size={18}/></button>
                                    <button onClick={() => onDelete(game.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition" title="Borrar"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PostsTab({ posts, onDelete }) {
    return (
        <div className="space-y-6 animate-in fade-in">
             <h3 className="text-xl font-bold text-white uppercase tracking-wider">Moderación de Posts</h3>
             <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-xs uppercase text-gray-400 font-bold tracking-wider">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Título</th>
                            <th className="p-4">Autor</th>
                            <th className="p-4">Likes</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-sans text-gray-300">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-gray-500">#{post.id}</td>
                                <td className="p-4 font-medium text-white truncate max-w-xs">{post.title}</td>
                                <td className="p-4 text-purple-300">{post.user?.username || 'N/A'}</td>
                                <td className="p-4 text-gray-400">{post.likeCount}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => onDelete(post.id)} className="p-2 hover:bg-red-900/20 rounded-lg text-red-400 transition" title="Eliminar permanentemente">
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
}

function AuditTab({ logs }) {
    return (
        <div className="space-y-6 animate-in fade-in">
             <h3 className="text-xl font-bold text-white uppercase tracking-wider">Registro de Auditoría</h3>
             <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-xs uppercase text-gray-400 font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Usuario ID</th>
                            <th className="p-4">Acción</th>
                            <th className="p-4">Detalles</th>
                            <th className="p-4">IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-sans text-gray-300">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="p-4 font-mono text-purple-400">{log.userId || 'SYSTEM'}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-[10px] font-bold uppercase">{log.action}</span></td>
                                <td className="p-4 max-w-md truncate text-gray-400">{log.details}</td>
                                <td className="p-4 text-gray-500 font-mono text-xs">{log.ipAddress || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
}

// --- MODAL DE JUEGOS (DARK MODE) ---
function GameModal({ game, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: game?.title || '',
        steamAppId: game?.steamAppId || '',
        shortDescription: game?.shortDescription || '',
        description: game?.description || '',
        price: game?.price || 0,
        category: game?.category || 'ACTION',
        platform: game?.platform || 'PC',
        headerImage: game?.headerImage || '',
        coverImageUrl: game?.coverImageUrl || '',
        stock: game?.stock || 0,
        active: game?.active !== undefined ? game.active : true,
        isFree: game?.isFree || false,
        featured: game?.featured || false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (game) await axiosInstance.put(`/admin/games/${game.id}`, formData);
            else await axiosInstance.post('/admin/games', formData);
            toast.success('Guardado exitosamente');
            onSave();
        } catch (error) { toast.error('Error al guardar'); } 
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-[#151515] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white">
                <div className="sticky top-0 bg-[#151515] p-6 border-b border-white/10 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold font-orbitron text-purple-400 uppercase tracking-wider">{game ? 'Editar Juego' : 'Nuevo Juego'}</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                     {/* Grid Layout for Inputs */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Título</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Steam ID</label>
                            <input type="text" name="steamAppId" value={formData.steamAppId} onChange={handleChange} disabled={!!game}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none disabled:opacity-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Precio</label>
                            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Stock</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">URL Imagen Header</label>
                            <input type="url" name="headerImage" value={formData.headerImage} onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Descripción Corta</label>
                            <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none resize-none" />
                        </div>
                     </div>

                     <div className="flex gap-6 pt-4 border-t border-white/10">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="accent-purple-600 w-4 h-4" />
                            <span className="text-sm text-gray-300">Activo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="accent-purple-600 w-4 h-4" />
                            <span className="text-sm text-gray-300">Gratis</span>
                        </label>
                     </div>

                     <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 text-sm font-bold uppercase">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 text-sm font-bold uppercase shadow-lg">
                            {loading ? 'Guardando...' : 'Guardar Juego'}
                        </button>
                     </div>
                </form>
            </div>
        </div>
    );
}