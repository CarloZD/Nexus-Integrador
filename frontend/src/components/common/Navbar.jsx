import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo o título */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Nexus Marketplace
            </button>
          </div>

          {/* Navegación */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/catalog')}
              className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              Catálogo
            </button>

            {token && (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <User size={20} />
                Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

