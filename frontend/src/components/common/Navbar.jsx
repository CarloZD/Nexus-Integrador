import { useState, useEffect } from 'react';
import { User, ShoppingCart, LogIn, UserPlus, LogOut, Shield, Gamepad2, Package, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
// Importamos tu logo
import logoImg from '../../assets/nexuslogo.png'; 

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isAuthenticated, getCurrentUser, logout } = useAuth();
  const { getItemCount, loadCart } = useCart();
  
  const user = getCurrentUser();
  const isLoggedIn = isAuthenticated();
  const cartCount = getItemCount();

  useEffect(() => {
    if (isLoggedIn) {
      loadCart();
    }
  }, [isLoggedIn]);

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleNavigate = (path) => {
    window.location.href = path;
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* NAVBAR PRINCIPAL 
          - Agregamos style={{ fontFamily: ... }} para forzar la letra "Press Start 2P"
          - Mantenemos h-[70px] y tus colores
      */}
      <nav 
        className="bg-black border-b border-white/10 sticky top-0 z-40 h-[75px] flex items-center"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        
        {/* --- 1. ZONA LOGO (BLOQUE MORADO IZQUIERDA) --- */}
        <div className="h-full flex items-center">
           <button 
             onClick={() => handleNavigate('/')}
             className="h-full bg-[#620ea] px-16 flex items-center justify-center transition-colors duration-300 group"
           >
              <img 
                src={logoImg} 
                alt="Nexus Logo" 
                className="h-14 w-auto object-contain group-hover:scale-105 transition-transform"
              />
           </button>
        </div>

        {/* CONTENEDOR CENTRAL Y DERECHO */}
        <div className="flex-1 flex justify-between items-center px-4 sm:px-10 h-full">

          {/* --- 2. MENÚ CENTRAL (LINKS) --- */}
          <div className="hidden md:flex items-center space-x-8 ml-4">
             {isLoggedIn ? (
                // OPCIONES PARA USUARIO LOGUEADO
                <>
                  <NavButton onClick={() => handleNavigate('/library')} icon={<Gamepad2 size={20} />} text="BIBLIOTECA" />
                  <NavButton onClick={() => handleNavigate('/community')} icon={<MessageSquare size={20} />} text="COMUNIDAD" />
                  <NavButton onClick={() => handleNavigate('/profile')} icon={<User size={20} />} text="PERFIL" />
                  
                  {/* Botón Admin (Oculto si no es admin) */}
                  {user?.role === 'ADMIN' && (
                    <NavButton onClick={() => handleNavigate('/admin')} icon={<Shield size={20} />} text="ADMIN" highlight />
                  )}
                </>
             ) : (
                // OPCIONES PARA VISITANTE
                <>
                  <NavButton onClick={() => handleNavigate('/community')} icon={<MessageSquare size={16} />} text="COMUNIDAD" />
                </>
             )}
          </div>

          {/* --- 3. ZONA DERECHA (USUARIO / LOGIN) --- */}
          <div className="flex items-center gap-6">
            
            {isLoggedIn ? (
              <>
                {/* CARRITO */}
                <button 
                  onClick={() => handleNavigate('/cart')}
                  className="relative text-white/80 hover:text-white hover:scale-110 transition-all group"
                >
                  <ShoppingCart size={25} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* INFO USUARIO (Mantenemos tu orden: Texto Izq, Avatar Der) */}
                <div className="hidden lg:flex items-center gap-5 pl-5 border-l border-white/20 h-8">
                  <div className="text-right hidden xl:block">
                    {/* Nombre de usuario */}
                    <p className="text-white text-[13px] font-bold tracking-wider uppercase">{user?.username || 'Gamer'}</p>
                    
                    {/* Rol (Solo aparece si es ADMIN) */}
                    {user?.role === 'ADMIN' && (
                      <p className="text-[9px] text-purple-600 font-bold mt-1">ADMINISTRADOR</p>
                    )}
                  </div>
                  
                  {/* AVATAR */}
                  <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-white overflow-hidden flex items-center justify-center">
                     {user?.avatarUrl ? (
                        <img 
                          src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080${user.avatarUrl}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                     ) : (
                        <User size={16} className="text-white/50" />
                     )}
                  </div>
                </div>

                {/* BOTÓN SALIR */}
                <button 
                  onClick={logout}
                  className="text-red-600 hover:text-red-600 transition-colors p-2 hover:bg-white/5 rounded-full"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              // BOTONES VISITANTE
              <div className="flex items-center gap-4 mr-14">
                 <button 
                   onClick={() => setShowLoginModal(true)}
                   className="text-white text-[11px] font-bold tracking-widest hover:text-purple-600 transition-colors uppercase"
                 >
                   INICIAR SESION
                 </button>
                 <button 
                   onClick={() => setShowRegisterModal(true)}
                   className="bg-white text-black px-6 py-2.5 rounded-full font-black text-[11px] tracking-widest hover:bg-purple-600 hover:text-white transition-all uppercase shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                 >
                   <span className="relative top-[1px]">REGISTRARSE</span>
                 </button>
              </div>
            )}

            {/* HAMBURGER MENU (Mobile) */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MENÚ MÓVIL DESPLEGABLE (También con la fuente forzada) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden bg-black border-b border-white/10 p-4"
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
           <div className="flex flex-col space-y-4">
              {isLoggedIn ? (
                 <>
                   <MobileLink onClick={() => handleNavigate('/library')} text="BIBLIOTECA" />
                   <MobileLink onClick={() => handleNavigate('/community')} text="COMUNIDAD" />
                   <MobileLink onClick={() => handleNavigate('/profile')} text="PERFIL" />
                   <MobileLink onClick={() => handleNavigate('/cart')} text={`CARRITO (${cartCount})`} />
                   <div className="border-t border-white/10 pt-4 mt-2">
                     <p className="text-purple-400 text-[10px] mb-2">USUARIO: {user?.username}</p>
                     <button onClick={logout} className="text-red-500 text-left text-[10px] font-bold py-2 uppercase">CERRAR SESIÓN</button>
                   </div>
                 </>
              ) : (
                 <>
                   <MobileLink onClick={() => handleNavigate('/')} text="CATALOGO" />
                   <MobileLink onClick={() => handleNavigate('/community')} text="COMUNIDAD" />
                 </>
              )}
           </div>
        </div>
      )}

      {/* MODALES */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}

function NavButton({ onClick, icon, text, highlight = false }) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center gap-2 text-[12px] font-bold tracking-widest transition-all duration-300 ease-out uppercase
        ${highlight 
          ? 'text-white hover:text-purple-400 hover:drop-shadow-[0_0_5px_rgba(168,85,247,1)]' 
          : 'text-white/70 hover:text-white hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
        }
      `}
    >
      {/* Icono */}
      {icon}
      
      {/* Texto */}
      <span>{text}</span>
      
      {/* EFECTO LÁSER INFERIOR: Se expande desde el centro */}
      <span className={`absolute -bottom-1 left-1/2 w-0 h-[2px] -translate-x-1/2 transition-all duration-300 group-hover:w-full 
        ${highlight ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-white shadow-[0_0_10px_white]'}
      `}></span>
    </button>
  );
}

function MobileLink({ onClick, text }) {
  return (
    <button 
      onClick={onClick} 
      className="group relative w-full text-left py-2 text-[10px] font-bold tracking-widest border-b border-white/5 uppercase overflow-hidden"
    >
      {/* Texto que se desplaza ligeramente */}
      <span className="relative z-10 text-white/80 transition-all duration-300 group-hover:text-white group-hover:pl-2 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] inline-block">
        {text}
      </span>
      
      {/* Efecto de barrido de luz en el fondo (opcional, muy sutil) */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
    </button>
  );
}