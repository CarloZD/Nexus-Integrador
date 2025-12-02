import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, LogIn } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './auth/LoginModal';

export default function Chatbot() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpenChatbot = () => {
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      toast.error('Debes iniciar sesión para usar el chatbot');
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    // Verificar autenticación antes de enviar
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para usar el chatbot');
      setShowLoginModal(true);
      setIsOpen(false);
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Agregar mensaje del usuario
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/chatbot/message', {
        message: userMessage
      });

      const botMessage = {
        role: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      // Si el error es 401 (no autenticado), cerrar el chatbot y mostrar login
      if (error.response?.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setIsOpen(false);
        setShowLoginModal(true);
        setMessages([]);
      } else {
        toast.error('Error al comunicarse con el chatbot. Por favor, intenta de nuevo.');
        
        const errorMessage = {
          role: 'bot',
          content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    // Dividir el texto en párrafos
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph.split('\n').map((line, lineIndex, array) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < array.length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {/* Botón flotante - siempre visible */}
      <button
        onClick={handleOpenChatbot}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Abrir chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              <Bot className="w-3 h-3" />
            </span>
          </>
        )}
      </button>

      {/* Ventana del chatbot - solo visible si está autenticado */}
      {isOpen && isAuthenticated() && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-lg">NexusBot</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Cerrar chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Bot className="w-12 h-12 mb-3 text-purple-500" />
                <p className="text-lg font-semibold mb-2">¡Hola! 👋</p>
                <p className="text-sm">
                  Soy NexusBot, tu asistente virtual. Estoy aquí para ayudarte a encontrar los juegos perfectos.
                </p>
                <p className="text-sm mt-2">
                  ¿Qué tipo de juegos te interesan?
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white text-gray-800 shadow-md border border-gray-200'
                    }`}
                  >
                    {message.role === 'bot' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-600">NexusBot</span>
                      </div>
                    )}
                    <div className="text-sm leading-relaxed">
                      {formatMessage(message.content)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-lg px-4 py-2 shadow-md border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-500 animate-pulse" />
                    <span className="text-sm text-gray-600">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

