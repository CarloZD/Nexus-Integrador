import { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Loader2, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, clearCart, loadCart } = useCart();
  const [processingItems, setProcessingItems] = useState(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) return;

    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      toast.error('Error al actualizar cantidad');
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

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

  const handleCheckout = () => {
    toast.success('Funcionalidad de pago próximamente', {
      duration: 3000,
      icon: '🚀'
    });
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver al catálogo
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            Carrito de Compras
          </h1>
          {!isEmpty && (
            <p className="text-gray-600 mt-2">
              {cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          )}
        </div>

        {isEmpty ? (
          // Carrito vacío
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Agrega algunos juegos increíbles para comenzar tu compra
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Explorar juegos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items del carrito */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-lg p-6 transition-all ${
                    processingItems.has(item.id) ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <img
                      src={item.game.headerImage}
                      alt={item.game.title}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/game/${item.game.id}`)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/128x80/1e3a8a/ffffff?text=No+Image';
                      }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-lg font-bold text-gray-900 mb-2 truncate cursor-pointer hover:text-primary-600 transition-colors"
                        onClick={() => navigate(`/game/${item.game.id}`)}
                      >
                        {item.game.title}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={processingItems.has(item.id) || item.quantity <= 1}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Disminuir cantidad"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-lg font-semibold w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={processingItems.has(item.id)}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Aumentar cantidad"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Precio y acciones */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-600">
                              ${parseFloat(item.subtotal).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500">
                                ${parseFloat(item.price).toFixed(2)} c/u
                              </p>
                            )}
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={processingItems.has(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar del carrito"
                          >
                            {processingItems.has(item.id) ? (
                              <Loader2 className="animate-spin" size={20} />
                            ) : (
                              <Trash2 size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón vaciar carrito */}
              {cart.items.length > 1 && (
                <button
                  onClick={handleClearCart}
                  disabled={loading}
                  className="w-full py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Vaciar carrito
                </button>
              )}
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Resumen del pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ${parseFloat(cart.total).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Items</span>
                    <span className="font-semibold">{cart.itemCount}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Envío</span>
                    <span className="text-green-600 font-medium">Gratis (Digital)</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Impuestos</span>
                    <span>Incluidos</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-primary-600">
                        ${parseFloat(cart.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl mb-3"
                >
                  Proceder al pago
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continuar comprando
                </button>

                {/* Información adicional */}
                <div className="mt-6 space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Entrega Digital Instantánea
                        </p>
                        <p className="text-xs text-blue-700">
                          Recibirás los juegos inmediatamente después del pago
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Garantía de 30 días
                        </p>
                        <p className="text-xs text-green-700">
                          Reembolso completo si no estás satisfecho
                        </p>
                      </div>
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