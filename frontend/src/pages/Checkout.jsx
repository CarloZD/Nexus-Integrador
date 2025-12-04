import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Smartphone, Loader2, CheckCircle, XCircle, ArrowLeft, QrCode, ShieldCheck, Lock, AlertCircle, Package, Gamepad2 } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';
import homeBg from '../assets/Astrogradiant.png';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [restoringCart, setRestoringCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentResult, setPaymentResult] = useState(null);
  
  // Yape QR
  const [yapeQR, setYapeQR] = useState(null);
  const [confirmingYape, setConfirmingYape] = useState(false);

  // Card form
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      toast.error('No se especificó una orden');
      navigate('/cart');
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(response.data);
      
      if (response.data.status !== 'PENDING') {
        toast.error('Esta orden ya fue procesada');
        // Opcional: redirigir si ya no está pendiente
        // navigate('/my-orders'); 
      }
    } catch (error) {
      console.error("Error cargando orden:", error);
      toast.error('Error al cargar la orden');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN PARA VOLVER AL CARRITO
  const handleReturnToCart = async () => {
    if (!orderId) {
      navigate('/cart');
      return;
    }

    // Si la orden ya no es pendiente, solo navegamos
    if (order && order.status !== 'PENDING') {
      navigate('/cart');
      return;
    }

    const confirmed = window.confirm(
      '¿Deseas cancelar esta compra y volver al carrito?'
    );
    
    if (!confirmed) return;

    setRestoringCart(true);
    try {
      // Cancelamos la orden pendiente para limpieza (opcional, pero recomendado)
      await axiosInstance.post(`/orders/${orderId}/cancel`);
      toast.success('Regresando al carrito...');
      navigate('/cart');
    } catch (error) {
      console.error('Error cancelando orden:', error);
      // Navegamos de todas formas para no bloquear al usuario
      navigate('/cart');
    } finally {
      setRestoringCart(false);
    }
  };

  const handleCardPayment = async () => {
    setProcessing(true);
    try {
      const response = await axiosInstance.post('/payments/card', {
        orderId: parseInt(orderId),
        paymentMethod: paymentMethod,
        ...cardData
      });

      setPaymentResult(response.data);

      if (response.data.status === 'COMPLETED') {
        toast.success('¡Pago exitoso!');
      } else {
        toast.error(response.data.message || 'Pago rechazado');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar el pago');
      setPaymentResult({ status: 'FAILED', message: error.response?.data?.message || 'Error de conexión' });
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateYapeQR = async () => {
    setProcessing(true);
    try {
      const response = await axiosInstance.post(`/payments/yape/generate-qr?orderId=${orderId}`);
      setYapeQR(response.data);
      toast.success('QR generado. Escanea con Yape.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al generar QR');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmYape = async () => {
    if (!yapeQR) return;
    
    setConfirmingYape(true);
    try {
      const response = await axiosInstance.post(`/payments/yape/confirm?paymentCode=${yapeQR.paymentCode}`);
      setPaymentResult(response.data);

      if (response.data.status === 'COMPLETED') {
        toast.success('¡Pago con Yape confirmado!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al confirmar pago');
    } finally {
      setConfirmingYape(false);
    }
  };

  // PANTALLA DE CARGA
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <Loader2 className="animate-spin text-purple-600" size={48} />
        <p className="text-white font-orbitron text-sm tracking-wider animate-pulse">CARGANDO ORDEN...</p>
      </div>
    );
  }

  // PANTALLA DE RESULTADO DE PAGO
  if (paymentResult) {
    const isSuccess = paymentResult.status === 'COMPLETED';
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-orbitron bg-cover bg-no-repeat bg-fixed"
           style={{ 
               backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.95)), url(${homeBg})`,
               backgroundPosition: 'center 0px'
           }}>
        
        <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
          {/* Efecto de fondo */}
          <div className={`absolute inset-0 opacity-10 ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}></div>
          <div className={`absolute top-0 left-0 right-0 h-1 ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}></div>
          
          <div className="relative z-10">
            {isSuccess ? (
              <>
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-pulse">
                  <CheckCircle className="text-green-400" size={48} />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-wider drop-shadow-lg">
                  ¡Pago Exitoso!
                </h2>
                <p className="text-gray-400 mb-6 font-sans text-sm leading-relaxed">
                  {paymentResult.message || 'Tu compra se ha procesado correctamente'}
                </p>
                
                <div className="bg-black/40 rounded-xl p-5 mb-8 text-left border border-green-500/20 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={16} className="text-green-400" />
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">ID de Transacción</p>
                  </div>
                  <p className="font-mono font-bold text-green-400 tracking-wider text-lg">
                    {paymentResult.orderNumber}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/library')}
                    className="w-full bg-green-600 text-black py-3 rounded-xl font-black uppercase tracking-widest hover:bg-green-500 transition shadow-lg"
                  >
                    Ir a Mi Biblioteca
                  </button>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition"
                  >
                    Ver Mis Órdenes
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full text-gray-500 hover:text-white py-2 text-sm font-medium transition-colors"
                  >
                    Volver al inicio
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  <XCircle className="text-red-500" size={48} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Pago Rechazado</h2>
                <p className="text-gray-400 mb-8 font-sans text-sm">{paymentResult.message}</p>
                
                <div className="space-y-3">
                    <button
                    onClick={() => setPaymentResult(null)}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-500 transition shadow-lg"
                    >
                    Intentar de nuevo
                    </button>
                    <button
                    onClick={handleReturnToCart}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition"
                    >
                    Volver al carrito
                    </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA PRINCIPAL DE CHECKOUT
  return (
    <div className="min-h-screen text-white font-orbitron pb-10 bg-cover bg-no-repeat bg-fixed"
         style={{ 
             backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.92)), url(${homeBg})`,
             backgroundPosition: 'center 0px'
         }}>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={handleReturnToCart}
            disabled={restoringCart || processing}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {restoringCart ? (
              <Loader2 size={18} className="animate-spin text-purple-500" />
            ) : (
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            )}
            <span className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">
              {restoringCart ? 'Restaurando Carrito...' : 'Cancelar y volver al carrito'}
            </span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#8b5cf6] drop-shadow-[0_0_20px_rgba(217,70,239,0.6)] mb-2"
                  style={{ textShadow: "0px 0px 25px rgba(168, 85, 247, 0.7)" }}>
                CHECKOUT
              </h1>
              <p className="text-gray-500 text-xs font-mono tracking-wider uppercase">
                Orden <span className="text-purple-400">#{order?.orderNumber}</span>
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center border-2 border-purple-500/30">
                <CreditCard size={36} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* --- COLUMNA IZQUIERDA: RESUMEN (2 columnas) --- */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-WHITE/80 backdrop-blur-md border border-white rounded-3xl p-8 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                    RESUMEN
                </h2>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-black/50">
                {order?.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-14 h-10 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                {/* Aquí deberías usar item.gameImage si el DTO lo trae. Si no, placeholder */}
                                {item.gameImage ? (
                                    <img src={item.gameImage} alt="Game" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
                                        <Gamepad2 size={18} className="text-purple-400/50" />
                                    </div>
                                )}
                             </div>
                             <div className="min-w-0">
                                <p className="font-bold text-sm text-white truncate pr-2">{item.gameTitle}</p>
                                <p className="text-[10px] text-gray-500">Licencia Digital</p>
                             </div>
                        </div>
                        <p className="font-bold text-[#4ade80] drop-shadow-sm flex-shrink-0 ml-2">S/. {item.subtotal?.toFixed(2)}</p>
                    </div>
                ))}
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold text-sm uppercase">Total a Pagar</span>
                        <span className="text-xl font-black text-[#4ade80] drop-shadow-[0_0_10px_rgba(74,222,128,0.4)]">
                            S/. {order?.totalAmount?.toFixed(2)}
                        </span>
                    </div>
                </div>
             </div>
             
             <div className="bg-black/40 border border-white rounded-2xl p-4 flex items-start gap-3">
                 <ShieldCheck className="text-green-500 mt-1 shrink-0" size={20} />
                 <div>
                     <p className="text-white text-sm font-bold">Pago 100% Seguro</p>
                     <p className="text-gray-500 text-xs font-sans mt-1">Todas las transacciones están encriptadas y protegidas. Tu información financiera nunca se almacena en nuestros servidores.</p>
                 </div>
             </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-black/80 border border-white rounded-3xl p-8 shadow-2xl h-fit">
              <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  METODO DE PAGO
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => { 
                    setPaymentMethod('CREDIT_CARD'); 
                    setYapeQR(null);
                    setCardData({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
                  }}
                  className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all relative overflow-hidden ${
                    paymentMethod === 'CREDIT_CARD' 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)]' 
                      : 'border-white/10 bg-black/30 text-gray-500 hover:border-white/30 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <CreditCard size={36} className={paymentMethod === 'CREDIT_CARD' ? 'text-purple-400' : 'text-gray-600'} />
                  <span className="font-bold text-sm uppercase tracking-wider">Tarjeta</span>
                  <span className="text-[10px] text-gray-500">Crédito / Débito</span>
                </button>
                
                <button
                  onClick={() => { 
                    setPaymentMethod('YAPE');
                    setCardData({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
                  }}
                  className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all relative overflow-hidden ${
                    paymentMethod === 'YAPE' 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)]' 
                      : 'border-white/10 bg-black/30 text-gray-500 hover:border-white/30 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {paymentMethod === 'YAPE' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <Smartphone size={36} className={paymentMethod === 'YAPE' ? 'text-purple-400' : 'text-gray-600'} />
                  <span className="font-bold text-sm uppercase tracking-wider">Yape</span>
                  <span className="text-[10px] text-gray-500">Código QR</span>
                </button>
              </div>

              {paymentMethod === 'CREDIT_CARD' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Número de Tarjeta</label>
                    <div className="relative">
                        <input
                          type="text"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                          className="w-full px-4 py-4 pl-12 bg-black/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition font-mono text-sm tracking-wider placeholder-gray-600"
                          placeholder="0000 0000 0000 0000"
                          autoComplete="off"
                          maxLength={19}
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Titular de la tarjeta</label>
                    <input
                      type="text"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({...cardData, cardHolder: e.target.value})}
                      className="w-full px-4 py-4 bg-black/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition font-sans text-sm uppercase placeholder-gray-600"
                      placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Mes</label>
                      <input
                        type="text"
                        value={cardData.expiryMonth}
                        onChange={(e) => setCardData({...cardData, expiryMonth: e.target.value})}
                        className="w-full px-4 py-4 bg-black/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition font-sans text-center placeholder-gray-600"
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Año</label>
                      <input
                        type="text"
                        value={cardData.expiryYear}
                        onChange={(e) => setCardData({...cardData, expiryYear: e.target.value})}
                        className="w-full px-4 py-4 bg-black/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition font-sans text-center placeholder-gray-600"
                        placeholder="AA"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">CVV</label>
                      <div className="relative">
                          <input
                          type="text"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                          className="w-full px-4 py-4 pr-10 bg-black/60 border border-white/20 rounded-xl text-white focus:ring-1 focus:ring-purple-500 outline-none transition font-sans text-center placeholder-gray-600"
                          placeholder="123"
                          maxLength={4}
                          />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCardPayment}
                    disabled={processing}
                    className="group w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-widest text-sm mt-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white hover:shadow-[0_0_10px_#4ade80]"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Pagar S/. {order?.totalAmount?.toFixed(2)}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-white mt-4">
                    Al confirmar el pago, aceptas los términos y condiciones
                  </p>
                </div>
              )}

              {/* Formulario Yape */}
              {paymentMethod === 'YAPE' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {!yapeQR ? (
                    <>
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                            <QrCode size={32} className="text-purple-400" />
                        </div>
                        <p className="text-white font-bold mb-2">Generar Código QR</p>
                        <p className="text-gray-400 text-xs font-sans">
                          Crea un código QR único para escanear y pagar directamente desde tu aplicación Yape.
                        </p>
                      </div>

                      <button
                        onClick={handleGenerateYapeQR}
                        disabled={processing}
                        className="w-full bg-[#742693] text-white py-4 rounded-xl font-black hover:bg-[#8a2daf] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(116,38,147,0.5)] uppercase tracking-widest text-sm"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Generando...
                          </>
                        ) : (
                          <>
                            <QrCode size={20} />
                            Generar QR Yape
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-white rounded-xl p-6 text-center shadow-2xl border-4 border-purple-500">
                        <p className="text-black font-bold mb-4 text-sm">Escanea con tu app Yape</p>
                        <div className="bg-white p-2 rounded-lg inline-block">
                          <QrCode size={180} className="text-black" />
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-2xl font-black text-purple-700 mb-1">
                              S/. {yapeQR.amount?.toFixed(2)}
                            </p>
                            <div className="bg-gray-100 rounded px-3 py-2 mt-2 inline-block">
                               <p className="text-xs text-gray-500 mb-1 uppercase font-bold">Código de Pago</p>
                               <p className="font-mono font-bold text-black text-lg tracking-widest">{yapeQR.paymentCode}</p>
                            </div>
                        </div>
                      </div>

                      <div className="text-center">
                          <p className="text-xs text-gray-500 mb-4 animate-pulse">Esperando confirmación...</p>
                          <button
                          onClick={handleConfirmYape}
                          disabled={confirmingYape}
                          className="w-full bg-green-600 text-white py-4 rounded-xl font-black hover:bg-green-500 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.4)] uppercase tracking-widest text-sm"
                          >
                          {confirmingYape ? (
                              <>
                              <Loader2 className="animate-spin" size={20} />
                              Verificando...
                              </>
                          ) : (
                              <>
                              <CheckCircle size={20} />
                              Ya realicé el pago
                              </>
                          )}
                          </button>
                          <button
                          onClick={() => setYapeQR(null)}
                          className="mt-4 text-gray-500 hover:text-white text-xs underline transition-colors"
                          >
                          Cancelar y generar nuevo código
                          </button>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}