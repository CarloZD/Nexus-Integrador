import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Filter, X, ChevronLeft, ChevronRight, ThumbsUp, MessageSquare, Calendar, Star } from 'lucide-react';
import { gameApi } from '../api/gameApi';
import axiosInstance from '../api/axiosConfig'; 
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Footer from '../components/common/Footer';

import homeBg from '../assets/Astrogradiant.png'; 

export default function Catalog() {
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]); 
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null); 
  
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const scrollContainerRef = useRef(null); 

  // ESTADO PARA EL SCROLL
  const [isScrolled, setIsScrolled] = useState(false);

  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const availableGenres = [
    'ACTION', 'ADVENTURE', 'RPG', 'STRATEGY', 'INDIE', 
    'SHOOTER', 'PUZZLE', 'PLATFORMER', 'ROGUELIKE', 
    'SIMULATION', 'MOBA', 'FPS', 'BATTLE ROYALE', 
    'SURVIVAL', 'HORROR'
  ];

  // DATOS SIMULADOS: NOTICIAS
  const newsData = [
    {
      id: 1,
      date: '14 mayo 2025',
      title: 'Monster Hunter Wilds revela tráiler extendido',
      desc: 'Nuevos monstruos y mapas dinámicos. Disponible en YouTube.',
      img: 'https://i.ytimg.com/vi/XmQnVA4IqSY/maxresdefault.jpg'
    },
    {
      id: 2,
      date: '26 octubre 2025',
      title: '¡GTA VI se prepara para el 2026!',
      desc: 'la empresa rockstar games anuncia el lanzamiento de gta vi para el próximo año.',
      img: 'https://alfabetajuega.com/hero/2025/05/gta6.1747223093.7085.jpg?width=768&aspect_ratio=16:9&format=nowebp'
    },
    {
      id: 3,
      date: '08 mayo 2025',
      title: '¡Rebajas de mitad de año activas!',
      desc: 'Juegos con hasta -70% de descuento por tiempo limitado.',
      img: 'https://cdn.akamai.steamstatic.com/store/home/store_home_share.jpg'
    }
  ];

  // OFERTAS ESPECIALES FIJAS
  const originalPriceAmongUs = 4.99;
  const discountAmongUs = 30; // 30%
  const originalPricePortal2 = 9.99;
  const discountPortal2 = 50; // 50%

  const specialOffersData = [
    {
        id: 'special-1', 
        title: 'Among Us',
        headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg',
        originalPrice: originalPriceAmongUs,
        discount: discountAmongUs,
        price: originalPriceAmongUs * (1 - discountAmongUs / 100)
    },
    {
        id: 'special-2',
        title: 'Portal 2',
        headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg',
        originalPrice: originalPricePortal2,
        discount: discountPortal2,
        price: originalPricePortal2 * (1 - discountPortal2 / 100)
    }
  ];

  useEffect(() => {
    loadData();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, selectedGenre, searchTerm]);

  useEffect(() => {
    setCurrentHeroIndex(0);
  }, [filteredGames]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (filteredGames.length > 0) {
        nextHero();
      }
    }, 5000); 
    return () => clearInterval(interval);
  }, [currentHeroIndex, filteredGames]);

  const loadData = async () => {
    try {
      setLoading(true);
      const gamesData = await gameApi.getAllGames();
      setGames(gamesData);
      setFilteredGames(gamesData);

      try {
        const reviewsResponse = await axiosInstance.get('/reviews/latest'); 
        const reviewsList = reviewsResponse.data.content || reviewsResponse.data;
        if (Array.isArray(reviewsList)) {
            setReviews(reviewsList.slice(0, 4)); 
        }
      } catch (reviewError) {
        console.error('Error cargando reseñas:', reviewError);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    let result = games;
    if (selectedGenre) {
      result = result.filter(game => 
        game.genres && game.genres.toUpperCase().includes(selectedGenre.toUpperCase())
      );
    }
    if (searchTerm.trim()) {
      result = result.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredGames(result);
  };

  const handleGenreClick = (genre) => {
    if (selectedGenre === genre) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genre);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const heroGames = filteredGames.slice(0, 5);
  const currentHeroGame = heroGames.length > 0 ? heroGames[currentHeroIndex] : null;

  const nextHero = () => {
    if (heroGames.length === 0) return;
    setCurrentHeroIndex((prev) => (prev === heroGames.length - 1 ? 0 : prev + 1));
  };
  
  const prevHero = () => {
    if (heroGames.length === 0) return;
    setCurrentHeroIndex((prev) => (prev === 0 ? heroGames.length - 1 : prev - 1));
  };

  const getGameImage = (gameId) => {
    const foundGame = games.find(g => g.id === gameId);
    return foundGame ? (foundGame.headerImage || foundGame.coverImageUrl) : 'https://via.placeholder.com/150';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-orbitron bg-cover bg-no-repeat"
         style={{ 
             backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.51), rgba(0, 0, 0, 0.51)), url(${homeBg})`,
             backgroundPosition: 'center 0px', 
             backgroundSize: '130%',
         }}>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* HEADER BIENVENIDA */}
        <div className="py-10 text-center relative">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]"
              style={{ textShadow: "0px 0px 20px rgba(168, 85, 247, 0.6)" }}>
            BIENVENIDO A NEXUS, {user?.username || 'GAMER'}
          </h1>
        </div>

        {/* BARRA DE FILTROS FLOTANTE */}
        <div className="mb-8 sticky top-[80px] z-30 transition-all duration-300">
            <div className={`flex flex-col lg:flex-row items-center justify-between bg-black/70 backdrop-blur-md border-2 rounded-full px-2 py-2 transition-all duration-500
                ${isScrolled 
                    ? 'border-white shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_30px_rgba(255,255,255,0.3)]' 
                    : 'border-transparent shadow-none' 
                }`}
            >
                <div className="flex items-center gap-2 w-full lg:w-auto overflow-hidden px-2 relative">
                    <button onClick={scrollLeft} className="p-1 hover:text-purple-600 transition-colors shrink-0">
                        <ChevronLeft size={24} />
                    </button>

                    <div 
                        ref={scrollContainerRef}
                        className="flex items-center overflow-x-auto no-scrollbar gap-2 w-full mask-linear-gradient scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {availableGenres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => handleGenreClick(genre)}
                                style={{ fontFamily: '"Press Start 2P", cursive' }}
                                className={`px-5 py-3 rounded-full text-[10px] transition-all whitespace-nowrap tracking-wider shrink-0 ${
                                    selectedGenre === genre 
                                    ? 'text-white bg-purple-700 shadow-[0_0_10px_rgba(147,51,234,0.5)] scale-105' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>

                    <button onClick={scrollRight} className="p-1 hover:text-purple-600 transition-colors shrink-0">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="relative w-full lg:w-[250px] mt-2 lg:mt-0 mr-1 shrink-0">
                    <input 
                        type="text" 
                        placeholder="BUSCAR" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1a1a1a]/80 border-none rounded-full py-2 pl-4 pr-10 text-xs text-white outline-none focus:bg-black transition-all font-sans placeholder:text-gray-500 text-right uppercase tracking-wider"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>
            </div>
        </div>

        {/* HERO SECTION */}
        {currentHeroGame ? (
          <div className="relative w-full h-[400px] md:h-[500px] rounded-[20px] overflow-hidden mb-12 group shadow-2xl transition-all duration-500">
              <img 
                src={currentHeroGame.headerImage || currentHeroGame.coverImageUrl} 
                alt={currentHeroGame.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/30"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

              <div className="absolute top-0 left-0 h-full w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center items-start z-10">
                  <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-2 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] max-w-md">
                      {currentHeroGame.title}
                  </h2>
                  <div className="flex gap-2 mb-6 mt-4">
                      {currentHeroGame.screenshots?.split(',').slice(0, 3).map((shot, idx) => (
                          <img key={idx} src={shot} className="w-20 h-14 object-cover rounded-md hover:border-white transition-colors border border-transparent" alt="preview" />
                      ))}
                  </div>
                  <div className="mt-auto">
                      <span className="text-[10px] font-bold text-green-400 tracking-widest block mb-2 uppercase">YA DISPONIBLE</span>
                      <div className="flex items-center gap-3">
                        <span className="bg-[#4ade80] text-black font-black text-lg px-6 py-2 rounded-lg -skew-x-12 shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                            {parseFloat(currentHeroGame.price) === 0 
                                ? 'GRATIS' 
                                : `S/ ${parseFloat(currentHeroGame.price).toFixed(2)}`
                            }
                        </span>
                        
                        <button 
                            onClick={() => window.location.href = `/game/${currentHeroGame.id}`}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold transition-all text-sm -skew-x-12 hover:scale-105"
                        >
                            <span className="inline-block skew-x-12">VER DETALLES</span>
                        </button>
                      </div>
                  </div>
              </div>
              <button onClick={prevHero} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-purple-600/80 transition-colors backdrop-blur-sm group-hover:opacity-100 opacity-0">
                  <ChevronLeft size={24} />
              </button>
              <button onClick={nextHero} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-purple-600/80 transition-colors backdrop-blur-sm group-hover:opacity-100 opacity-0">
                  <ChevronRight size={24} />
              </button>
          </div>
        ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 border-none rounded-2xl mb-12 bg-black/50">
                <p>No se encontraron juegos para este filtro.</p>
            </div>
        )}

        {/* OFERTAS ESPECIALES (FIJAS) */}
        <div className="mb-12">
            <h3 className="text-sm md:text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-white"
                style={{ fontFamily: '"Press Start 2P", cursive' }}>
                OFERTAS ESPECIALES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {specialOffersData.map((game) => (
                    <div key={game.id} className="relative h-[250px] rounded-2xl overflow-hidden group cursor-pointer border-none shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                         onClick={() => {
                             const realGame = games.find(g => g.title.toLowerCase().includes(game.title.toLowerCase()));
                             if(realGame) window.location.href = `/game/${realGame.id}`;
                         }}>
                        <img 
                            src={game.headerImage} 
                            alt={game.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4 bg-green-500 text-black font-black text-xl px-4 py-2 rounded-lg transform rotate-3 shadow-lg">
                            -{game.discount}%
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                             <div className="flex flex-col w-full">
                                 <h4 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-md uppercase">
                                    {game.title}
                                 </h4>
                                 <div className="flex items-center gap-4">
                                    <span className="text-gray-400 line-through text-lg font-bold">S/ {game.originalPrice.toFixed(2)}</span>
                                    <span className="text-[#4ade80] font-black text-2xl drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                                        S/. {game.price.toFixed(2)}
                                    </span>
                                 </div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- CATÁLOGO COMPLETO --- */}
        <div className="mb-16">
             <h3 className="text-sm md:text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-white border-white/20 pb-2"
                 style={{ fontFamily: '"Press Start 2P", cursive' }}>
                {selectedGenre ? `JUEGOS DE ${selectedGenre}` : 'CATALOGO COMPLETO'}
            </h3>

            {filteredGames.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No se encontraron juegos en esta categoría.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGames.map((game) => (
                        <div key={game.id} className="relative bg-black rounded-xl overflow-hidden transition-all group cursor-pointer shadow-lg hover:shadow-[0_5px_20px_rgba(0,0,0,1)] hover:-translate-y-1"
                             onClick={() => window.location.href = `/game/${game.id}`}>
                            
                            {/* Imagen */}
                            <div className="h-[180px] overflow-hidden relative">
                                <img 
                                    src={game.headerImage || game.coverImageUrl} 
                                    alt={game.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-bold border border-white px-4 py-1 rounded-full italic tracking-widest hover:bg-white hover:text-black transition-colors">VER</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h4 className="text-white font-bold truncate mb-1">{game.title}</h4>
                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="flex flex-wrap gap-1">
                                        {game.genres && game.genres.split(',').map((g, i) => (
                                            <span key={i} className="text-[12px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-bold">
                                                {g.trim()}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        {/* Efecto Luz LED verde en precio */}
                                        <span className="text-[#4ade80] font-bold text-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_3px_#4ade80]">
                                            {parseFloat(game.price) === 0 
                                                ? 'GRATIS' 
                                                : `S/. ${parseFloat(game.price).toFixed(2)}`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* GRID INFERIOR: NOTICIAS Y RESEÑAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* NOTICIAS */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-6">
                 <h3 className="text-xs md:text-xl font-bold mb-6 border-b border-white/10 pb-3 uppercase tracking-wider text-gray-200"
                     style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
                    Noticias y actualizaciones
                </h3>
                <div className="space-y-6">
                    {newsData.map((news) => (
                        <div key={news.id} className="flex gap-4 group cursor-pointer">
                            <div className="w-[140px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden relative shadow-lg">
                                <img src={news.img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="news" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-wider">{news.date}</p>
                                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-purple-300 transition-colors leading-tight">
                                    {news.title}
                                </h4>
                                <p className="text-[11px] text-gray-400 font-sans leading-snug line-clamp-2">
                                    {news.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RESEÑAS DE LA COMUNIDAD */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-xs md:text-xl font-bold mb-6 border-b border-white/10 pb-3 uppercase tracking-wider text-gray-200"
                    style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
                    Reseñas de la comunidad
                </h3>
                
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-xs italic">No hay reseñas recientes.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => {
                            const isRecommended = review.rating >= 4;
                            const reviewGameImage = getGameImage(review.gameId);

                            return (
                                <div key={review.id} className="relative bg-black/80 rounded-xl p-4 flex gap-4 group transition-all shadow-md hover:shadow-lg">
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[11px] text-white font-bold italic leading-relaxed mb-3 line-clamp-3">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {review.userAvatar ? (
                                                <img src={review.userAvatar} alt={review.username} className="w-5 h-5 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                                                    {review.username ? review.username.charAt(0) : '?'}
                                                </div>
                                            )}
                                            <span className="text-[10px] font-bold text-gray-400 uppercase truncate max-w-[100px]">
                                                {review.username || 'Anónimo'}
                                            </span>
                                            {isRecommended && (
                                                <ThumbsUp size={12} className="text-[#4ade80] ml-auto flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative w-[100px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                        <img src={reviewGameImage} className="w-full h-full object-cover" alt={review.gameTitle} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                        <p className="absolute bottom-1 right-1 left-1 text-center text-[8px] font-black text-white uppercase tracking-wider drop-shadow-md truncate">
                                            {review.gameTitle}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>

      </div>
    
      <Footer />
      
    </div>
  );
}