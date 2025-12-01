import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Smartphone, Loader2, CheckCircle, XCircle, ArrowLeft, QrCode } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentResult, setPaymentResult] = useState(null);
  
  // Yape QR
  const [yapeQR, setYapeQR] = useState(null);
  const [confirmingYape, setConfirmingYape] = useState(false);

  // Card form
  const [cardData, setCardData] = useState({
    cardNumber: '4111111111111111',
    cardHolder: 'JUAN PEREZ',
    expiryMonth: '12',
    expiryYear: '2025',
    cvv: '123'
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
        navigate('/my-orders');
      }
    } catch (error) {
      toast.error('Error al cargar la orden');
      navigate('/cart');
    } finally {
      setLoading(false);
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
      setPaymentResult({ status: 'FAILED', message: error.response?.data?.message });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  // Payment Success/Failed Screen
  if (paymentResult) {
    const isSuccess = paymentResult.status === 'COMPLETED';
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          {isSuccess ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
              <p className="text-gray-600 mb-6">{paymentResult.message}</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-500">Número de transacción</p>
                <p className="font-mono font-bold">{paymentResult.orderNumber}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/library')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Ir a Mi Biblioteca
                </button>
                <button
                  onClick={() => navigate('/my-orders')}
                  className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Ver Mis Órdenes
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="text-red-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago Rechazado</h2>
              <p className="text-gray-600 mb-6">{paymentResult.message}</p>
              <button
                onClick={() => setPaymentResult(null)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Intentar de nuevo
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft size={20} />
          Volver al carrito
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Resumen de la Orden</h2>
            <p className="text-gray-500 text-sm mb-4">Orden #{order?.orderNumber}</p>
            
            <div className="space-y-3 mb-6">
              {order?.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{item.gameTitle}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${item.subtotal?.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">${order?.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Método de Pago</h2>

            {/* Method Selection */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => { setPaymentMethod('CREDIT_CARD'); setYapeQR(null); }}
                className={`flex-1 p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${
                  paymentMethod === 'CREDIT_CARD' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard size={32} className={paymentMethod === 'CREDIT_CARD' ? 'text-primary-600' : 'text-gray-400'} />
                <span className="font-medium">Tarjeta</span>
              </button>
              <button
                onClick={() => { setPaymentMethod('YAPE'); }}
                className={`flex-1 p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${
                  paymentMethod === 'YAPE' 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone size={32} className={paymentMethod === 'YAPE' ? 'text-purple-600' : 'text-gray-400'} />
                <span className="font-medium">Yape</span>
              </button>
            </div>

            {/* Card Form */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="4111 1111 1111 1111"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Titular</label>
                  <input
                    type="text"
                    value={cardData.cardHolder}
                    onChange={(e) => setCardData({...cardData, cardHolder: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="JUAN PEREZ"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                    <input
                      type="text"
                      value={cardData.expiryMonth}
                      onChange={(e) => setCardData({...cardData, expiryMonth: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                    <input
                      type="text"
                      value={cardData.expiryYear}
                      onChange={(e) => setCardData({...cardData, expiryYear: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="123"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCardPayment}
                  disabled={processing}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pagar ${order?.totalAmount?.toFixed(2)}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Datos de prueba precargados. En producción, ingresa datos reales.
                </p>
              </div>
            )}

            {/* Yape */}
            {paymentMethod === 'YAPE' && (
              <div className="space-y-4">
                {!yapeQR ? (
                  <>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                      <QrCode size={48} className="mx-auto text-purple-600 mb-2" />
                      <p className="text-purple-800">
                        Genera un código QR para pagar con tu app de Yape
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateYapeQR}
                      disabled={processing}
                      className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Generando QR...
                        </>
                      ) : (
                        <>
                          <QrCode size={20} />
                          Generar QR de Yape
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-white border-2 border-purple-300 rounded-xl p-6 text-center">
                      <div className="bg-purple-100 rounded-lg p-4 mb-4">
                        <QrCode size={120} className="mx-auto text-purple-600" />
                        <p className="text-xs mt-2 font-mono text-purple-700 break-all">
                          {yapeQR.qrCodeData}
                        </p>
                      </div>
                      
                      <p className="text-2xl font-bold text-purple-700 mb-2">
                        S/. {yapeQR.amount?.toFixed(2)}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        Código: <span className="font-mono font-bold">{yapeQR.paymentCode}</span>
                      </p>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left text-sm mb-4">
                        <p className="font-semibold text-yellow-800 mb-1">Instrucciones:</p>
                        <ol className="text-yellow-700 list-decimal list-inside space-y-1">
                          <li>Abre tu app de Yape</li>
                          <li>Escanea este código QR</li>
                          <li>Confirma el pago</li>
                          <li>Haz clic en "Ya pagué" abajo</li>
                        </ol>
                      </div>

                      <p className="text-xs text-red-500 mb-4">
                        Expira en: {new Date(yapeQR.expiresAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmYape}
                      disabled={confirmingYape}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {confirmingYape ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Ya pagué con Yape
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setYapeQR(null)}
                      className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancelar y generar nuevo QR
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

