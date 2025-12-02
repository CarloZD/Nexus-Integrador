import { useState, useEffect } from 'react';
import { Loader2, Gamepad2, Clock, HardDrive, Play, Download, Trash2, Search } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';

export default function Library() {
  const [library, setLibrary] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, installed, recent

  useEffect(() => {
    loadLibrary();
    loadStats();
  }, []);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/library');
      setLibrary(response.data);
    } catch (error) {
      console.error('Error loading library:', error);
      toast.error('Error al cargar la biblioteca');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axiosInstance.get('/library/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleInstall = async (gameId) => {
    try {
      await axiosInstance.post(`/library/${gameId}/install`);
      toast.success('¡Juego instalado!');
      loadLibrary();
      loadStats();
    } catch (error) {
      toast.error('Error al instalar');
    }
  };

  const handleUninstall = async (gameId) => {
    try {
      await axiosInstance.post(`/library/${gameId}/uninstall`);
      toast.success('Juego desinstalado');
      loadLibrary();
      loadStats();
    } catch (error) {
      toast.error('Error al desinstalar');
    }
  };

  const handlePlay = async (gameId) => {
    try {
      await axiosInstance.post(`/library/${gameId}/play?minutes=30`);
      toast.success('¡Jugando! (+30 minutos registrados)');
      loadLibrary();
      loadStats();
    } catch (error) {
      toast.error('Error al registrar tiempo de juego');
    }
  };

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.gameTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'installed') return matchesSearch && item.isInstalled;
    if (filter === 'recent') return matchesSearch && item.lastPlayed;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Gamepad2 size={40} />
            Mi Biblioteca
          </h1>
          <p className="text-gray-400">Tus juegos adquiridos</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Juegos</p>
              <p className="text-3xl font-bold text-blue-400">{stats.totalGames}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Instalados</p>
              <p className="text-3xl font-bold text-green-400">{stats.installedGames}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Tiempo Jugado</p>
              <p className="text-3xl font-bold text-purple-400">{stats.totalPlayTime}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Gastado</p>
              <p className="text-3xl font-bold text-yellow-400">${stats.totalSpent?.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar en tu biblioteca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('installed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'installed' ? 'bg-green-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              Instalados
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'recent' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              Recientes
            </button>
          </div>
        </div>

        {/* Library Grid */}
        {filteredLibrary.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl">
            <Gamepad2 className="mx-auto text-gray-600 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-2">
              {library.length === 0 ? 'Tu biblioteca está vacía' : 'No se encontraron juegos'}
            </h2>
            <p className="text-gray-400">
              {library.length === 0 
                ? 'Compra juegos para verlos aquí' 
                : 'Intenta con otro término de búsqueda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibrary.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition">
                <img
                  src={item.gameImage || 'https://via.placeholder.com/460x215'}
                  alt={item.gameTitle}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 truncate">{item.gameTitle}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {item.playTimeFormatted}
                    </span>
                    <span className={`flex items-center gap-1 ${item.isInstalled ? 'text-green-400' : ''}`}>
                      <HardDrive size={14} />
                      {item.isInstalled ? 'Instalado' : 'No instalado'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {item.isInstalled ? (
                      <>
                        <button
                          onClick={() => handlePlay(item.gameId)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                        >
                          <Play size={18} />
                          Jugar
                        </button>
                        <button
                          onClick={() => handleUninstall(item.gameId)}
                          className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
                          title="Desinstalar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleInstall(item.gameId)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                      >
                        <Download size={18} />
                        Instalar
                      </button>
                    )}
                  </div>

                  {item.lastPlayed && (
                    <p className="text-xs text-gray-500 mt-3">
                      Último juego: {new Date(item.lastPlayed).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



