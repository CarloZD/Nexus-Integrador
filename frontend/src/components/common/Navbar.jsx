import { useState, useEffect } from 'react';
import { User, ShoppingCart, LogIn, UserPlus, LogOut, Heart, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isAuthenticated, getCurrentUser, logout } = useAuth();
  const { getItemCount, loadCart } = useCart();
  
  const user = getCurrentUser();
  const isLoggedIn = isAuthenticated();
  const cartCount = getItemCount();

  // Cargar carrito cuando el usuario inicia sesión
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
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavigate('/')}
                className="flex items-center"
              >
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-2xl px-4 py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all">
                  NEXUS
                </div>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleNavigate('/')}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Catálogo
              </button>
              {isLoggedIn && (
                <>
                  <button
                    onClick={() => handleNavigate('/profile')}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Mi Perfil
                  </button>
                  
                  {/* Botón Admin - solo visible para ADMIN */}
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleNavigate('/admin')}
                      className="flex items-center gap-2 text-purple-700 hover:text-purple-900 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-purple-50"
                    >
                      <Shield size={18} />
                      Admin
                    </button>
                  )}
                </>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {/* User Info */}
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
                    <User size={18} />
                    <span className="font-medium">{user?.username}</span>
                    {user?.role === 'ADMIN' && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                        ADMIN
                      </span>
                    )}
                  </div>

                  {/* Wishlist/Favoritos */}
                  <button
                    onClick={() => handleNavigate('/profile')}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Mi Perfil"
                  >
                    <Heart size={20} />
                  </button>

                  {/* Cart con contador */}
                  <button
                    onClick={() => handleNavigate('/cart')}
                    className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Carrito"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="hidden md:inline">Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                  >
                    <LogIn size={18} />
                    <span className="hidden md:inline">Iniciar Sesión</span>
                  </button>

                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    <UserPlus size={18} />
                    <span className="hidden md:inline">Registrarse</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu - opcional */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isLoggedIn && (
              <>
                <button
                  onClick={() => handleNavigate('/')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium"
                >
                  Catálogo
                </button>
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium"
                >
                  Mi Perfil
                </button>
                <button
                  onClick={() => handleNavigate('/cart')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium"
                >
                  Carrito {cartCount > 0 && `(${cartCount})`}
                </button>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleNavigate('/admin')}
                    className="block w-full text-left px-3 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md text-sm font-medium"
                  >
                    Panel Admin
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
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