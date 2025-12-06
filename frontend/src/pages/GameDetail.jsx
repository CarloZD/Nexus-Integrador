import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShoppingCart, Heart, User, CheckCircle, 
    ThumbsUp, ThumbsDown, Globe, Gamepad2, Library, Share2, Monitor, Cpu
} from 'lucide-react';
import { gameApi } from '../api/gameApi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosConfig';
import ReviewSection from '../components/reviews/ReviewSection';
import homeBg from '../assets/Astrogradiant.png';

export default function GameDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { getCurrentUser } = useAuth();

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [userOwnsGame, setUserOwnsGame] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); 

    const token = localStorage.getItem('token');
    const user = getCurrentUser();

    useEffect(() => {
        loadGame();
        if (token) {
            loadFavoriteStatus();
            checkGameOwnership();
        }
    }, [id, token]);

    const loadGame = async () => {
        try {
            setLoading(true);
            const data = await gameApi.getGameById(id);
            setGame(data);
            setSelectedImage(data.headerImage || data.coverImageUrl);
        } catch (error) {
            console.error('Error loading game:', error);
            toast.error('Error al cargar el juego');
        } finally {
            setLoading(false);
        }
    };

    const loadFavoriteStatus = async () => {
        try {
            const response = await axiosInstance.get(`/user/favorites/${id}/check`);
            setIsFavorite(response.data.isFavorite);
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const checkGameOwnership = async () => {
        try {
            const response = await axiosInstance.get(`/library/owns/${id}`);
            setUserOwnsGame(response.data.owns);
        } catch (error) {
            console.error('Error checking game ownership:', error);
            setUserOwnsGame(false);
        }
    };

    const toggleFavorite = async () => {
        if (!token) {
            toast.error('Debes iniciar sesión para agregar favoritos');
            return;
        }

        setFavoriteLoading(true);
        try {
            const url = `/user/favorites/${id}`;
            const method = isFavorite ? 'DELETE' : 'POST';

            await axiosInstance({ method, url });
            setIsFavorite(!isFavorite);
            toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Error al actualizar favoritos');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!token) {
            toast.error('Debes iniciar sesión para agregar al carrito');
            return;
        }

        if (game.stock <= 0) {
            toast.error('Producto sin stock');
            return;
        }

        setAddingToCart(true);
        try {
            await addToCart(game.id, 1);
            setAddedToCart(true);

            setTimeout(() => {
                setAddedToCart(false);
            }, 2000);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-orbitron">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Juego no encontrado</h2>
                    <button onClick={() => navigate('/')} className="text-purple-400 hover:text-purple-300 underline">
                        Volver al catálogo
                    </button>
                </div>
            </div>
        );
    }

    const screenshots = game.screenshots ? game.screenshots.split(',').filter(s => s.trim()) : [];
    const allImages = [game.headerImage || game.coverImageUrl, ...screenshots].filter(Boolean);
    const uniqueImages = [...new Set(allImages)];

    return (
        <div className="min-h-screen text-white font-orbitron pb-10 bg-cover bg-no-repeat"
             style={{ 
                 backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${homeBg})`,
                 backgroundPosition: 'center 0px'
             }}>
            
            {/* Header Navigation */}
            <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-[75px] z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        // CAMBIO: Efecto morado brilloso (LED) al hacer hover
                        className="flex items-center gap-2 text-white hover:text-white hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} />
                        Volver al catálogo
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* --- HERO SECTION (CAJA ÚNICA UNIFICADA) --- */}
                {/* CAMBIO: Este div ahora encierra TODO (Imagen + Info) en un solo cuadro negro transparente */}
                <div className="bg-black/60 backdrop-blur-md rounded-[30px] p-6 md:p-8 shadow-xl mb-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* COLUMNA IZQUIERDA: IMÁGENES (7 cols) */}
                        <div className="lg:col-span-7 space-y-4">
                            {/* Imagen Principal */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                                <img 
                                    src={selectedImage} 
                                    alt={game.title} 
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                            </div>

                            {/* Galería de Miniaturas */}
                            {uniqueImages.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {uniqueImages.slice(0, 6).map((img, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden  transition-all ${
                                                selectedImage === img 
                                                ? 'border-white opacity-100' 
                                                : 'border-transparent opacity-50 hover:opacity-100 hover:border-white/30'
                                            }`}
                                        >
                                            <img src={img} alt={`shot-${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* COLUMNA DERECHA: INFO (5 cols) */}
                        <div className="lg:col-span-5 flex flex-col">
                            
                            {/* Título y Descripción */}
                            <div className="mb-4">
                                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight uppercase" 
                                    style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.4' }}>
                                    {game.title}
                                </h1>
                                <div className="p-1">
                                    <p className="text-sm text-gray-300 font-sans leading-relaxed">
                                        {game.description || "Sumérgete en esta increíble experiencia. Gráficos mejorados, jugabilidad inmersiva y un mundo detallado te esperan."}
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {game.genres && game.genres.split(',').slice(0, 3).map((genre, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 text-[10px] font-bold rounded-md border border-gray-700 uppercase tracking-wider">
                                        {genre.trim()}
                                    </span>
                                ))}
                            </div>
                            
                            {/* Estado */}
                            <div className="mb-8">
                                <span className={`text-[12px] font-black uppercase tracking-widest ${
                                    game.stock > 0 ? 'text-[#4ade80]' : 'text-red-500'
                                }`}>
                                    {game.stock > 0 ? '• DISPONIBLE' : '• AGOTADO'}
                                </span>
                            </div>

                            {/* Bloque de Precio y Acción */}
                            <div className="mt-auto pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <div className="flex flex-col">
                                        {game.isFree ? (
                                            <span className="text-4xl font-black text-[#4ade80] drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">GRATIS</span>
                                        ) : (
                                            <span className="text-4xl font-black text-[#4ade80] drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                                                S/. {parseFloat(game.price).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={toggleFavorite}
                                        className={`p-3 rounded-xl transition-all bg-black/40 hover:bg-black/60 ${
                                            isFavorite 
                                            ? 'text-red-500 hover:scale-110' 
                                            : 'text-gray-400 hover:text-white hover:scale-110'
                                        }`}
                                    >
                                        <Heart size={28} fill={isFavorite ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {userOwnsGame ? (
                                    <button 
                                        onClick={() => navigate('/library')}
                                        className="w-full py-4 bg-purple-700 hover:bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center gap-3"
                                    >
                                        <Library size={20} />
                                        EN TU BIBLIOTECA
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleAddToCart}
                                        disabled={addingToCart || game.stock <= 0 || addedToCart}
                                        className={`w-full py-4 font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                                            addedToCart 
                                            ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' 
                                            : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]'
                                        } ${game.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {addingToCart ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                        ) : addedToCart ? (
                                            <> <CheckCircle size={20} /> AGREGADO </>
                                        ) : (
                                            <> 
                                              <ShoppingCart size={20} /> 
                                              AGREGAR AL CARRITO 
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- SECCIÓN INFERIOR (GRID 2 COLUMNAS) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* IZQUIERDA (2/3): RESEÑAS */}
                    <div className="lg:col-span-2">
                        <div className="bg-black/60 backdrop-blur-md border border-white rounded-[30px] p-1 overflow-hidden">
                            <div className="p-4 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                                    TUS RESEÑAS
                                </h2>
                            </div>
                            <div className="p-6">
                                <ReviewSection gameId={id} userOwnsGame={userOwnsGame} />
                            </div>
                        </div>
                    </div>

                    {/* DERECHA (1/3): ESPECIFICACIONES */}
                    <div className="lg:col-span-1">
                        <div className="bg-black/60 backdrop-blur-md border border-white rounded-[30px] p-6 sticky top-24 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-6 text-left uppercase tracking-widest" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                                Especificaciones
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-300 border-b border-white/10 pb-3">
                                    <User size={18} className="text-purple-500" />
                                    <span>Un jugador</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-300 border-b border-white/10 pb-3">
                                    <Globe size={18} className="text-blue-500" />
                                    <span>Multijugador masivo</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-300 border-b border-white/10 pb-3">
                                    <Gamepad2 size={18} className="text-green-500" />
                                    <span>JcJ en línea</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-300 border-b border-white/10 pb-3">
                                    <Monitor size={18} className="text-yellow-500" />
                                    <span>Cooperativo en línea</span>
                                </div>

                                <div className="mt-8 text-xs text-gray-400 space-y-3 font-sans tracking-wider">
                                    <div className="flex justify-between">
                                        <span className="uppercase font-bold">Desarrollador</span>
                                        <span className="text-white">Nexus Studios</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="uppercase font-bold">Lanzamiento</span>
                                        <span className="text-white">2025</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="uppercase font-bold">Plataforma</span>
                                        <span className="text-white">PC / Windows</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}