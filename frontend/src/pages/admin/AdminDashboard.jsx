import { useState, useEffect } from 'react';
import { Users, Package, TrendingUp, Activity, Shield, Loader2, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/users?size=10')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.content || usersRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error al cargar datos de administración');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/toggle-status`);
      toast.success('Estado del usuario actualizado');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar el usuario');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar el usuario');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona usuarios, juegos y configuración</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-green-600 mt-1">{stats?.activeUsers || 0} activos</p>
              </div>
              <Users className="text-primary-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.adminUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Con permisos completos</p>
              </div>
              <Shield className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Regulares</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.regularUsers || 0}</p>
              </div>
              <Package className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Inactivos</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.inactiveUsers || 0}</p>
              </div>
              <Activity className="text-red-600" size={40} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vista General
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Usuarios ({users.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del Sistema</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total de usuarios registrados</span>
                <span className="font-bold text-primary-600">{stats?.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Usuarios activos</span>
                <span className="font-bold text-green-600">{stats?.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Administradores</span>
                <span className="font-bold text-purple-600">{stats?.adminUsers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Usuarios regulares</span>
                <span className="font-bold text-blue-600">{stats?.regularUsers}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title={user.active ? 'Desactivar' : 'Activar'}
                          >
                            {user.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}