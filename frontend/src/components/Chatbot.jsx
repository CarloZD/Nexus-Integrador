import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
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

    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para usar el chatbot');
      setShowLoginModal(true);
      setIsOpen(false);
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
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
      
      if (error.response?.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setIsOpen(false);
        setShowLoginModal(true);
        setMessages([]);
      } else {
        const errorMessage = {
          role: 'bot',
          content: 'Lo siento, mis circuitos están fallando. Por favor intenta de nuevo más tarde.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-2' : ''}>
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
      
      {/* BOTÓN FLOTANTE NEXUS STYLE */}
      <button
        onClick={handleOpenChatbot}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-110 group flex items-center justify-center border-white/10
          ${isOpen 
            ? 'bg-red-600 hover:bg-red-500 rotate-90 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
            : 'bg-gradient-to-r from-black to-purple-700 hover:shadow-[0_0_30px_rgba(147,51,234,0.8)]'
          }`}
        aria-label="Abrir chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            {/* Indicador de estado */}
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-black"></span>
            </span>
          </>
        )}
      </button>

      {/* VENTANA DEL CHATBOT */}
      {isOpen && isAuthenticated() && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[350px] md:w-[400px] h-[550px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl font-sans">
          
          {/* Header Futurista */}
          <div className="bg-gradient-to-r from-purple-900/90 to-black p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black border border-purple-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)] relative overflow-hidden">
                <div className="absolute inset-0 bg-purple-500/20 animate-pulse"></div>
                <Bot className="w-6 h-6 text-purple-400 relative z-10" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-wider" style={{ fontFamily: '"Press Start 2P", cursive' }}>NEXUS AI</h3>
                <div className="flex items-center gap-1.5 mt-1">
                   <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse shadow-[0_0_5px_#4ade80]"></span>
                   <span className="text-[9px] text-[#4ade80] font-bold uppercase tracking-wide">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors hover:bg-white/10 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-black/50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4 p-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                    <Sparkles className="w-10 h-10 text-purple-500 animate-pulse" />
                </div>
                <div>
                    <p className="text-lg font-bold text-white mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>¡HOLA GAMER!</p>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                      Soy tu asistente Nexus. Pregúntame sobre recomendaciones, precios o detalles de tus juegos favoritos.
                    </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md border ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-purple-700 to-blue-700 text-white rounded-tr-none border-transparent'
                        : 'bg-[#111] text-gray-200 border-white/10 rounded-tl-none'
                    }`}
                  >
                    {message.role === 'bot' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                        <Bot className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">NexusBot</span>
                      </div>
                    )}
                    <div className="font-sans">
                      {formatMessage(message.content)}
                    </div>
                    <p className={`text-[9px] mt-2 text-right ${message.role === 'user' ? 'text-white/50' : 'text-gray-600'}`}>
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[#111] border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-[#0a0a0a] border-t border-white/10">
            <div className="relative flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-[#151515] text-white border border-white/10 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600 text-sm font-sans"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:bg-transparent disabled:text-gray-600 transition-all shadow-[0_0_10px_rgba(147,51,234,0.3)]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}