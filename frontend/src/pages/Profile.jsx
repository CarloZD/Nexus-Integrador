import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/userApi';
import { Loader2, User, ShieldCheck, ShoppingBag, Trophy, Activity, Mail, AlertTriangle } from 'lucide-react';

const FALLBACK_USER = {
  fullName: 'Invitado Nexus',
  email: 'invitado@nexus.gg',
  username: 'guest',
  role: 'USER',
};

const STAT_ICON_MAP = {
  purchases: ShoppingBag,
  hours: Activity,
  achievements: Trophy,
};

const formatAmount = (amount) => (typeof amount === 'number' ? amount.toFixed(2) : '0.00');

export default function Profile() {
  const { getCurrentUser } = useAuth();
  const [currentUser] = useState(() => getCurrentUser());
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.id) {
        setErrorMessage('Debes iniciar sesión para ver tu perfil');
        setLoading(false);
        return;
      }

      try {
        const data = await userApi.getProfile(currentUser.id);
        setProfile(data);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.response?.status === 403
            ? 'No tienes permisos para ver esta sección (requiere rol ADMIN).'
            : 'No se pudo cargar tu perfil. Intenta nuevamente.');
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-lg max-w-lg">
          <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No se pudo cargar el perfil</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => window.location.assign('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const user = profile?.user || currentUser || FALLBACK_USER;
  const stats = profile?.stats || [];
  const orders = profile?.recentOrders || [];
  const achievements = profile?.achievements || [];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Encabezado */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-28" />
          <div className="-mt-16 px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                  <User className="text-primary-600" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Mail size={16} className="text-primary-500" />
                    {user.email}
                  </p>
                  <p className="text-sm text-primary-600 font-medium mt-1">Rol: {user.role || 'USER'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition">
                  Editar perfil
                </button>
                <button className="px-6 py-3 border border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-gray-300 transition">
                  Preferencias
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(({ id, label, value, sublabel }) => {
            const Icon = STAT_ICON_MAP[id] || Activity;
            const colorClass =
              id === 'purchases' ? 'text-primary-600' : id === 'achievements' ? 'text-amber-600' : 'text-emerald-600';
            const bgClass =
              id === 'purchases' ? 'bg-primary-50' : id === 'achievements' ? 'bg-amber-50' : 'bg-emerald-50';

            return (
              <div key={id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center mb-4`}>
                  <Icon className={colorClass} size={24} />
                </div>
                <p className="text-sm text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm text-gray-400">{sublabel}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Actividad reciente */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pedidos recientes</h2>
                <p className="text-sm text-gray-500">Últimos movimientos en tu cuenta</p>
              </div>
              <button className="text-primary-600 text-sm font-semibold hover:text-primary-700">Ver historial</button>
            </div>
            <div className="space-y-4">
              {orders.length === 0 && (
                <p className="text-sm text-gray-500">Aún no tienes pedidos registrados.</p>
              )}
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                  <div>
                    <p className="font-semibold text-gray-900">{order.game}</p>
                    <p className="text-sm text-gray-500">
                      {order.id} • {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${formatAmount(order.total)}</p>
                    <p className={`text-sm ${order.status === 'Entregado' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seguridad */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-primary-600" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
                <p className="text-sm text-gray-500">Mantén tu cuenta protegida</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600">Autenticación</p>
                <p className="font-semibold text-gray-900">2FA pendiente de activar</p>
              </div>
              <div className="p-4 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-600">Último inicio de sesión</p>
                <p className="font-semibold text-gray-900">Hace 2 horas • CDMX</p>
              </div>
              <button className="w-full border border-primary-100 text-primary-600 font-semibold py-3 rounded-2xl hover:bg-primary-50 transition">
                Revisar actividad
              </button>
            </div>
          </div>
        </div>

        {/* Logros */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Logros y progreso</h2>
              <p className="text-sm text-gray-500">Sigue desbloqueando recompensas</p>
            </div>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">Ver todos</button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {achievements.length === 0 && <p className="text-sm text-gray-500">Aún no tienes logros registrados.</p>}
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 rounded-2xl border border-gray-100 hover:border-primary-200 transition">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="text-amber-500" size={20} />
                  <p className="font-semibold text-gray-900">{achievement.title}</p>
                </div>
                <p className="text-sm text-gray-500 mb-3">{achievement.detail}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{achievement.progress}% completado</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

