import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShoppingCart, Heart, Calendar, User, Building, DollarSign,
    Loader2, CheckCircle, Package, ThumbsUp, ThumbsDown, Star,
    Users, Globe, Gamepad2, MessageSquare
} from 'lucide-react';
import { gameApi } from '../api/gameApi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosConfig';
import ReviewSection from '../components/reviews/ReviewSection';

export default function GameDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { getCurrentUser } = useAuth();

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [userOwnsGame, setUserOwnsGame] = useState(false);

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

        if (quantity > game.stock) {
            toast.error(`Solo hay ${game.stock} unidades disponibles`);
            return;
        }

        setAddingToCart(true);
        try {
            await addToCart(game.id, quantity);
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

    const handleBuyNow = async () => {
        if (!token) {
            toast.error('Debes iniciar sesión para comprar');
            return;
        }

        setAddingToCart(true);
        try {
            await addToCart(game.id, quantity);
            navigate('/cart');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    const incrementQuantity = () => {
        if (quantity < game.stock) {
            setQuantity(quantity + 1);
        } else {
            toast.error(`Stock máximo: ${game.stock} unidades`);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Juego no encontrado</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-purple-400 hover:text-purple-300"
                    >
                        Volver al catálogo
                    </button>
                </div>
            </div>
        );
    }

    // Parsear screenshots
    const screenshots = game.screenshots ? game.screenshots.split(',').filter(s => s.trim()) : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
            {/* Header con título */}
            <div className="bg-gray-800 border-b border-purple-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-purple-300 mb-4 hover:text-purple-200 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver
                    </button>

                    <div className="flex items-start gap-6">
                        {/* Imagen principal del juego */}
                        <div className="flex-shrink-0">
                            <img
                                src={game.headerImage || game.coverImageUrl}
                                alt={game.title}
                                className="w-64 h-80 object-cover rounded-lg shadow-2xl"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/256x320/4c1d95/ffffff?text=No+Image';
                                }}
                            />
                            {/* Thumbnails de screenshots */}
                            {screenshots.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                    {screenshots.slice(0, 5).map((screenshot, idx) => (
                                        <img
                                            key={idx}
                                            src={screenshot.trim()}
                                            alt={`Screenshot ${idx + 1}`}
                                            className="w-16 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition"
                                            onClick={() => window.open(screenshot.trim(), '_blank')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Información del juego */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-3">{game.title}</h1>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                {game.shortDescription || game.description || 'Sin descripción disponible'}
                            </p>

                            {game.genres && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {game.genres.split(',').slice(0, 2).map((genre, index) => (
                                        <span
                                            key={index}
                                            className="bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium"
                                        >
                      {genre.trim()}
                    </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                {game.stock > 0 ? (
                                    <span className="text-green-400 font-semibold">DISPONIBLE</span>
                                ) : (
                                    <span className="text-red-400 font-semibold">AGOTADO</span>
                                )}
                            </div>
                        </div>

                        {/* Precio y botón de compra */}
                        <div className="flex-shrink-0 text-right">
                            <div className="mb-4">
                                {game.isFree ? (
                                    <div className="text-3xl font-bold text-green-400">GRATIS</div>
                                ) : (
                                    <div className="text-3xl font-bold text-green-400">
                                        ${parseFloat(game.price).toFixed(2)}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || game.stock <= 0 || addedToCart}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                    addedToCart
                                        ? 'bg-green-600 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {addingToCart ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Agregando...
                                    </>
                                ) : addedToCart ? (
                                    <>
                                        <CheckCircle size={18} />
                                        ¡Agregado!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={18} />
                                        Agregar al carrito
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna izquierda - Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        <ReviewSection gameId={id} userOwnsGame={userOwnsGame} />
                    </div>

                    {/* Columna derecha - Especificaciones */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 border-2 border-purple-700 rounded-lg p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-4">Especificaciones</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <User size={20} className="text-purple-400" />
                                    <span>Un jugador</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Users size={20} className="text-purple-400" />
                                    <span>Multijugador masivo</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Globe size={20} className="text-purple-400" />
                                    <span>JcJ en línea</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Gamepad2 size={20} className="text-purple-400" />
                                    <span>Cooperativo en línea</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-semibold">Precio</h3>
                                    {game.isFree ? (
                                        <span className="text-2xl font-bold text-green-400">GRATIS</span>
                                    ) : (
                                        <span className="text-2xl font-bold text-green-400">
                      ${parseFloat(game.price).toFixed(2)}
                    </span>
                                    )}
                                </div>

                                {!game.isFree && game.stock > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-300 mb-2">Cantidad</label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1}
                                                className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    if (val >= 1 && val <= game.stock) {
                                                        setQuantity(val);
                                                    }
                                                }}
                                                min="1"
                                                max={game.stock}
                                                className="w-16 text-center bg-gray-700 text-white rounded py-1"
                                            />
                                            <button
                                                onClick={incrementQuantity}
                                                disabled={quantity >= game.stock}
                                                className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Máximo {game.stock} unidades</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart || game.stock <= 0 || addedToCart}
                                        className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                            addedToCart
                                                ? 'bg-green-600 text-white'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        } disabled:opacity-50`}
                                    >
                                        {addingToCart ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : addedToCart ? (
                                            <>
                                                <CheckCircle size={18} />
                                                Agregado
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} />
                                                Agregar al carrito
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        disabled={addingToCart || game.stock <= 0}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        Comprar ahora
                                    </button>

                                    {token && (
                                        <button
                                            onClick={toggleFavorite}
                                            disabled={favoriteLoading}
                                            className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                                                isFavorite
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                            } disabled:opacity-50`}
                                        >
                                            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                                            {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                                        </button>
                                    )}
                                </div>

                                {game.stock > 0 ? (
                                    <div className="mt-4 p-2 bg-green-900/30 border border-green-500 rounded text-center">
                                        <p className="text-sm text-green-400">
                                            ✓ En stock / {game.stock} disponibilidad
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-2 bg-red-900/30 border border-red-500 rounded text-center">
                                        <p className="text-sm text-red-400">✗ Agotado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}