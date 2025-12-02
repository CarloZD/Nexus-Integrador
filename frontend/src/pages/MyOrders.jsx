import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Loader2, Eye, CreditCard } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/orders/my-orders/all');
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta orden?')) return;

    try {
      await axiosInstance.post(`/orders/${orderId}/cancel`);
      toast.success('Orden cancelada');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    }
  };

  const handlePayOrder = (orderId) => {
    navigate(`/checkout?orderId=${orderId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock size={14} />
            Pendiente
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={14} />
            Completada
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle size={14} />
            Cancelada
          </span>
        );
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Órdenes</h1>
        <p className="text-gray-600 mb-8">Historial de compras y estado de pedidos</p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes órdenes</h2>
            <p className="text-gray-600 mb-6">Cuando realices una compra, aparecerá aquí</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Explorar juegos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Orden</p>
                      <p className="font-mono font-bold text-lg">{order.orderNumber}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <p className="text-2xl font-bold text-primary-600">
                        ${order.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                    <span>
                      <strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      <strong>Items:</strong> {order.itemCount}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Eye size={18} />
                      Ver detalles
                    </button>

                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handlePayOrder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <CreditCard size={18} />
                          Pagar ahora
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                        >
                          <XCircle size={18} />
                          Cancelar
                        </button>
                      </>
                    )}

                    {order.status === 'COMPLETED' && (
                      <button
                        onClick={() => navigate('/library')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        <Package size={18} />
                        Ver en biblioteca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailModal 
            orderId={selectedOrder.id}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      toast.error('Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Detalle de Orden</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="animate-spin mx-auto text-primary-600" size={32} />
          </div>
        ) : order ? (
          <div className="p-6">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Número de orden</p>
                  <p className="font-mono font-bold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <p className="font-bold">{order.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Método de pago</p>
                  <p className="font-medium">{order.paymentMethod || 'Pendiente'}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <h3 className="font-bold mb-4">Productos</h3>
            <div className="space-y-3 mb-6">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.gameImage || 'https://via.placeholder.com/80'}
                    alt={item.gameTitle}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.gameTitle}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-bold">${item.subtotal?.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Error al cargar la orden
          </div>
        )}
      </div>
    </div>
  );
}



