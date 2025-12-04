import { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Loader2, ShoppingCart, Trash2, AlertCircle, CreditCard, Gamepad2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosConfig'; // Asegúrate de importar axiosInstance
import homeBg from '../assets/Astrogradiant.png';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, removeFromCart, clearCart, loadCart } = useCart();
  const [processingItems, setProcessingItems] = useState(new Set());
  const [creatingOrder, setCreatingOrder] = useState(false); // Estado para loading del checkout

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('¿Eliminar este juego del carrito?')) return;
    
    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      await removeFromCart(itemId);
    } catch (error) {
      toast.error('Error al eliminar item');
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('¿Estás seguro de vaciar todo el carrito?')) return;
    
    try {
      await clearCart();
    } catch (error) {
      toast.error('Error al vaciar el carrito');
    }
  };

  const handleCheckout = async () => {
    setCreatingOrder(true);
    try {
      // Usamos axiosInstance en lugar de fetch para consistencia con tokens y headers
      const response = await axiosInstance.post('/orders/checkout', { 
        paymentMethod: 'PENDING' 
      });

      const order = response.data;
      toast.success('Orden creada. Redirigiendo al pago...');
      
      // Navegar al checkout con el orderId
      navigate(`/checkout?orderId=${order.id}`);
    } catch (error) {
      console.error('Error en checkout:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la orden');
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen text-white font-orbitron pb-10 bg-cover bg-no-repeat"
         style={{ 
             backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${homeBg})`,
             backgroundPosition: 'center 0px'
         }}>
      
      {/* CAMBIO: Eliminada la barra de navegación "Volver al catálogo" que estaba aquí */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title */}
        <div className="mb-8 flex items-center justify-between mt-8"> {/* Agregado mt-8 para compensar la falta de nav */}
          <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]"
                  style={{ textShadow: "0px 0px 20px rgba(168, 85, 247, 0.6)" }}>
                CARRITO DE COMPRAS
              </h1>
              {!isEmpty && (
                <p className="text-gray-400 mt-2 text-sm tracking-wider">
                  TIENES <span className="text-white font-bold">{cart.itemCount}</span> {cart.itemCount === 1 ? 'PRODUCTO' : 'PRODUCTOS'} EN TU CARRITO
                </p>
              )}
          </div>
          {!isEmpty && (
             <div className="hidden md:block">
                 <ShoppingCart size={48} className="text-purple-500/20" />
             </div>
          )}
        </div>

        {isEmpty ? (
          // --- CARRITO VACÍO ---
          <div className="bg-black/60 backdrop-blur-md rounded-[30px] shadow-xl border border-white/10 p-12 text-center flex flex-col items-center mt-10">
            <div className="w-24 h-24 bg-black/50 rounded-full flex items-center justify-center mb-6 border-2 border-white/10">
                <Gamepad2 className="text-gray-600" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-400 mb-8 max-w-md font-sans">
              Parece que aún no has agregado ninguna aventura a tu colección. ¡Explora el catálogo y encuentra tu próximo desafío!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)]"
            >
              Explorar juegos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LISTA DE ITEMS (IZQUIERDA) --- */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row gap-4 transition-all group hover:border-purple-500/30 ${
                    processingItems.has(item.id) ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {/* Imagen */}
                  <div className="w-full sm:w-40 h-24 rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer border border-white/5 group-hover:border-white/20 transition-all"
                       onClick={() => navigate(`/game/${item.game.id}`)}>
                     <img
                      src={item.game.headerImage}
                      alt={item.game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/128x80/1e3a8a/ffffff?text=No+Image';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 
                                className="text-lg font-bold text-white truncate cursor-pointer hover:text-purple-400 transition-colors uppercase tracking-wide"
                                onClick={() => navigate(`/game/${item.game.id}`)}
                            >
                                {item.game.title}
                            </h3>
                            <div className="flex gap-2 mt-1">
                                {item.game.genres && item.game.genres.split(',').slice(0, 2).map((g, i) => (
                                    <span key={i} className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-gray-400 border border-white/5">
                                        {g.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        {/* Botón eliminar */}
                        <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={processingItems.has(item.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                            title="Eliminar del carrito"
                        >
                            {processingItems.has(item.id) ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Trash2 size={18} />
                            )}
                        </button>
                    </div>

                    <div className="flex justify-end items-end mt-2 sm:mt-0">
                        <p className="text-xl font-black text-[#4ade80] drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">
                            S/. {parseFloat(item.subtotal).toFixed(2)}
                        </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón vaciar carrito */}
              {cart.items.length > 1 && (
                <button
                  onClick={handleClearCart}
                  disabled={loading}
                  className="w-full py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
                >
                  <Trash2 size={16} />
                  Vaciar todo el carrito
                </button>
              )}
            </div>

            {/* --- RESUMEN (DERECHA) --- */}
            <div className="lg:col-span-1">
              <div className="bg-[#151515] border border-white/10 rounded-[30px] p-6 sticky top-24 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4" 
                    style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
                  RESUMEN
                </h2>

                <div className="space-y-4 mb-8 font-sans text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">
                      S/. {parseFloat(cart.total).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Cantidad</span>
                    <span className="text-white font-bold">{cart.itemCount} juegos</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Envío</span>
                    <span className="text-[#4ade80] font-bold text-xs uppercase">Digital / Inmediato</span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white uppercase tracking-wide">Total</span>
                      <span className="text-2xl font-black text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                        S/. {parseFloat(cart.total).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 text-right mt-1">Impuestos incluidos</p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={creatingOrder}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      PROCESANDO...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      PAGAR AHORA
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Seguir comprando
                </button>

                {/* Información adicional */}
                <div className="mt-8 space-y-3">
                  <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex gap-3">
                    <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-200 mb-1 uppercase">Entrega Inmediata</p>
                      <p className="text-[10px] text-blue-300/80 font-sans leading-tight">
                        Tus juegos estarán disponibles en tu biblioteca automáticamente después del pago.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex gap-3">
                    <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-green-200 mb-1 uppercase">Compra Segura</p>
                      <p className="text-[10px] text-green-300/80 font-sans leading-tight">
                        Transacciones encriptadas y garantía de satisfacción.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}