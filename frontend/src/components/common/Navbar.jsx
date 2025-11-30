import { useState } from 'react';
import { User, ShoppingCart, LogIn, UserPlus, LogOut, Heart, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isAuthenticated, getCurrentUser, logout } = useAuth();
  
  const user = getCurrentUser();
  const isLoggedIn = isAuthenticated();

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center"
              >
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-2xl px-4 py-2 rounded-lg">
                  NEXUS
                </div>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Catálogo
              </button>
              {isLoggedIn && (
                <>
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Mi Perfil
                  </button>
                  
                  {/* Botón Admin - solo visible para ADMIN */}
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => window.location.href = '/admin'}
                      className="flex items-center gap-2 text-purple-700 hover:text-purple-900 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-purple-50"
                    >
                      <Shield size={18} />
                      Admin
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.location.href = '/cart'}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Carrito
                  </button>
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

                  {/* Quick Actions */}
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Mi Perfil"
                  >
                    <Heart size={20} />
                  </button>

                  <button
                    onClick={() => window.location.href = '/cart'}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                    title="Carrito"
                  >
                    <ShoppingCart size={20} />
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