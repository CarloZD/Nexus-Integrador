import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData);
      onClose();
      setFormData({ email: '', password: '' });
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
          <p className="text-primary-100 text-sm mt-1">
            Bienvenido de vuelta a Nexus
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Switch to Register */}
          <div className="text-center pt-4 border-t">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}