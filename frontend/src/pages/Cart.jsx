// frontend/src/pages/Cart.jsx
import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { Loader2, ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, clearCart, loadCart } = useCart();

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      await updateQuantity(itemId, newQuantity);
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

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
        </div>

        {isEmpty ? (
          // Carrito vacío
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Agrega algunos juegos para comenzar tu compra
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
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
                  className="bg-white rounded-xl shadow-lg p-6 flex gap-4"
                >
                  {/* Imagen */}
                  <img
                    src={item.game.headerImage}
                    alt={item.game.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {item.game.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={loading}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={loading}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Precio */}
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
                        onClick={() => removeFromCart(item.id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón vaciar carrito */}
              <button
                onClick={clearCart}
                disabled={loading}
                className="w-full py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold disabled:opacity-50"
              >
                Vaciar carrito
              </button>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Resumen del pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ${parseFloat(cart.total).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-semibold">{cart.itemCount}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary-600 text-2xl">
                      ${parseFloat(cart.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Funcionalidad de checkout próximamente')}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg"
                >
                  Proceder al pago
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Los juegos se entregarán digitalmente después del pago
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}