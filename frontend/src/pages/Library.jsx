import { useState, useEffect } from 'react';
import { Loader2, Gamepad2, Clock, HardDrive, Play, Download, Trash2, Search, Filter } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';
import homeBg from '../assets/Astrogradiant.png';

export default function Library() {
  const [library, setLibrary] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, installed, recent
  
  // ESTADO PARA EL SCROLL
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadLibrary();
    loadStats();

    // DETECTAR SCROLL PARA BARRA FLOTANTE
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="py-10 text-center relative">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]"
              style={{ textShadow: "0px 0px 20px rgba(168, 85, 247, 0.6)" }}>
            MI BIBLIOTECA
          </h1>
          <p className="text-gray-400 mt-2 font-sans tracking-widest text-sm uppercase">Tus juegos adquiridos</p>
        </div>

        {/* STATS (Grid de 3 columnas ahora) */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center hover:border-purple-500/30 transition-colors shadow-lg">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>Total Juegos</p>
              <p className="text-3xl font-black text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">{stats.totalGames}</p>
            </div>
            <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center hover:border-green-500/30 transition-colors shadow-lg">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>Instalados</p>
              <p className="text-3xl font-black text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">{stats.installedGames}</p>
            </div>
            <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center hover:border-yellow-500/30 transition-colors shadow-lg">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>Invertido</p>
              <p className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">${stats.totalSpent?.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* BARRA DE FILTROS FLOTANTE */}
        <div className="mb-12 sticky top-[80px] z-30 transition-all duration-300">
            <div className={`flex flex-col md:flex-row items-center justify-between bg-black/70 backdrop-blur-md border-2 rounded-full px-4 py-4 transition-all duration-500
                ${isScrolled 
                    ? 'border-white shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_30px_rgba(255,255,255,0.3)]' 
                    : 'border-transparent shadow-none' 
                }`}
            >
                {/* Botones de Filtro */}
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto no-scrollbar items-center" style={{ scrollbarWidth: 'none' }}>
                   <button
                      onClick={() => setFilter('all')}
                      style={{ fontFamily: '"Press Start 2P", cursive' }}
                      // CAMBIO AQUÍ: Eliminado 'scale-105' para que no cambie de tamaño al seleccionar
                      className={`px-6 py-3 rounded-full text-[12px] transition-all whitespace-nowrap tracking-wider outline-none focus:outline-none focus:ring-0 ${
                        filter === 'all' 
                          ? 'text-white bg-purple-700 shadow-[0_0_10px_rgba(147,51,234,0.5)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                   >
                      TODOS
                   </button>
                   <button
                      onClick={() => setFilter('installed')}
                      style={{ fontFamily: '"Press Start 2P", cursive' }}
                      // CAMBIO AQUÍ: Eliminado 'scale-105'
                      className={`px-6 py-3 rounded-full text-[12px] transition-all whitespace-nowrap tracking-wider outline-none focus:outline-none focus:ring-0 ${
                        filter === 'installed' 
                          ? 'text-white bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.5)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                   >
                      INSTALADOS
                   </button>
                   <button
                      onClick={() => setFilter('recent')}
                      style={{ fontFamily: '"Press Start 2P", cursive' }}
                      // CAMBIO AQUÍ: Eliminado 'scale-105'
                      className={`px-6 py-3 rounded-full text-[12px] transition-all whitespace-nowrap tracking-wider outline-none focus:outline-none focus:ring-0 ${
                        filter === 'recent' 
                          ? 'text-white bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                   >
                      RECIENTES
                   </button>
                </div>

                {/* Buscador */}
                <div className="relative w-full md:w-[300px] mt-3 md:mt-0 md:ml-auto">
                    <input 
                        type="text" 
                        placeholder="BUSCAR EN BIBLIOTECA" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1a1a1a]/80 border-none rounded-full py-3 pl-4 pr-10 text-xs text-white outline-none focus:bg-black transition-all font-sans placeholder:text-gray-500 text-right uppercase tracking-wider"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
            </div>
        </div>

        {/* GRID DE BIBLIOTECA */}
        {filteredLibrary.length === 0 ? (
          <div className="text-center py-16 bg-[#0a0a0a]/50 rounded-2xl border border-white/5">
            <Gamepad2 className="mx-auto text-gray-600 mb-4" size={64} />
            <h2 className="text-xl font-bold mb-2 text-gray-300">
              {library.length === 0 ? 'Tu biblioteca está vacía' : 'No se encontraron juegos'}
            </h2>
            <p className="text-gray-500 text-sm">
              {library.length === 0 
                ? 'Compra juegos en el catálogo para verlos aquí' 
                : 'Intenta con otro término de búsqueda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLibrary.map((item) => (
              <div key={item.id} className="relative bg-black rounded-xl overflow-hidden transition-all group cursor-pointer shadow-lg hover:shadow-[0_5px_20px_rgba(0,0,0,1)] hover:-translate-y-1">
                
                {/* Imagen */}
                <div className="h-[160px] overflow-hidden relative">
                  <img
                    src={item.gameImage || 'https://via.placeholder.com/460x215'}
                    alt={item.gameTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay con estado */}
                  <div className="absolute top-2 right-2">
                     {item.isInstalled ? (
                        <span className="bg-green-500/90 text-black text-[8px] font-black px-2 py-1 rounded shadow-lg backdrop-blur-sm">INSTALADO</span>
                     ) : (
                        <span className="bg-black/60 text-gray-300 text-[8px] font-bold px-2 py-1 rounded backdrop-blur-sm border border-white/10">NO INSTALADO</span>
                     )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold truncate mb-3 text-sm tracking-wide">{item.gameTitle}</h3>
                  
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-4 font-sans">
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                      <Clock size={12} className="text-purple-400" />
                      {item.playTimeFormatted}
                    </div>
                    {item.lastPlayed && (
                        <span className="text-gray-500 italic">
                           {new Date(item.lastPlayed).toLocaleDateString()}
                        </span>
                    )}
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2">
                    {item.isInstalled ? (
                      <>
                        <button
                          onClick={() => handlePlay(item.gameId)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-black text-[10px] flex items-center justify-center gap-2 transition-all uppercase shadow-[0_0_10px_rgba(22,163,74,0.3)] hover:shadow-[0_0_15px_rgba(22,163,74,0.6)] outline-none focus:outline-none"
                        >
                          <Play size={14} fill="currentColor" />
                          Jugar
                        </button>
                        <button
                          onClick={() => handleUninstall(item.gameId)}
                          className="p-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors border border-red-500/30 outline-none focus:outline-none"
                          title="Desinstalar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleInstall(item.gameId)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-black text-[10px] flex items-center justify-center gap-2 transition-all uppercase shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] outline-none focus:outline-none"
                      >
                        <Download size={14} />
                        Instalar
                      </button>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}