import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Clock, CheckCircle, XCircle, Loader2, Eye, CreditCard, 
  Search, ArrowLeft, ShoppingBag, Calendar 
} from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';
import homeBg from '../assets/Astrogradiant.png';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtrado local
  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(term) ||
      // Si items existe, buscamos por nombre de juego
      (order.items && order.items.some(item => item.gameTitle?.toLowerCase().includes(term)))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <Clock size={12} /> Pendiente
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-[#4ade80] border border-green-500/50 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle size={12} /> Completada
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <XCircle size={12} /> Cancelada
          </span>
        );
      default:
        return <span className="text-gray-400 text-xs">{status}</span>;
    }
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
             backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${homeBg})`,
             backgroundPosition: 'center 0px'
         }}>
      
      {/* Header Navigation */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-[75px] z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all text-xs font-bold uppercase tracking-widest"
              >
                  <ArrowLeft size={16} />
                  Volver al perfil
              </button>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]"
                style={{ textShadow: "0px 0px 20px rgba(168, 85, 247, 0.6)" }}>
              MIS ÓRDENES
            </h1>
            <p className="text-gray-400 text-xs font-sans mt-2 uppercase tracking-wide">
              Historial de compras y estado de pedidos
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-[300px]">
             <input 
                 type="text" 
                 placeholder="BUSCAR ORDEN..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-black/60 border border-white/20 rounded-full py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-purple-500 transition-all font-sans placeholder:text-gray-600"
             />
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-[30px] p-12 text-center">
            <Package className="mx-auto text-gray-700 mb-4" size={64} />
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No tienes órdenes</h2>
            <p className="text-gray-500 font-sans text-sm mb-8">Cuando realices una compra, aparecerá aquí.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-purple-500 transition shadow-lg"
            >
              Explorar juegos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all shadow-lg group">
                
                {/* Header de la Tarjeta */}
                <div className="bg-white/5 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">ORDEN</span>
                            <span className="font-mono text-white font-bold tracking-wide">{order.orderNumber}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-sans mt-1">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Package size={12}/> {order.itemCount || order.items?.length || 0} items</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         {getStatusBadge(order.status)}
                         <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                            <p className="text-xl font-black text-[#4ade80] drop-shadow-sm">S/. {order.totalAmount?.toFixed(2)}</p>
                         </div>
                    </div>
                </div>

                {/* Lista de Items (Visualización compacta) */}
                {order.items && order.items.length > 0 && (
                    <div className="px-6 py-4 bg-black/20 border-t border-white/5">
                        <div className="flex flex-col gap-2">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-300 font-sans">
                                    <span>• {item.gameTitle}</span>
                                    <span className="text-gray-500">S/. {item.subtotal?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div className="px-6 py-4 flex justify-end gap-3 border-t border-white/5 bg-black/40">
                    {order.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handlePayOrder(order.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg"
                            >
                                <CreditCard size={14} /> Pagar Ahora
                            </button>
                            <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-900/20 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition"
                            >
                                <XCircle size={14} /> Cancelar
                            </button>
                        </>
                    )}
                    
                    {order.status === 'COMPLETED' && (
                        <button
                            onClick={() => navigate('/library')}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/50 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                        >
                            <ShoppingBag size={14} /> Ver en Biblioteca
                        </button>
                    )}

                    {/* Solo ver detalle (si no está pendiente) */}
                    {order.status !== 'PENDING' && (
                         <div className="text-xs text-gray-600 font-mono flex items-center ml-auto md:ml-0">
                             ID: {order.id}
                         </div>
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