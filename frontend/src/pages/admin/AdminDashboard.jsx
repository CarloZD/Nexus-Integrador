import { Gamepad2, Users, Shield, Activity, ShoppingBag, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

const metrics = [
  { id: 'users', label: 'Usuarios activos', value: '1,248', trend: '+18% vs. mes pasado', icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
  { id: 'sales', label: 'Ventas del mes', value: '$42K', trend: '+6% crecimiento', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'games', label: 'Juegos publicados', value: '320', trend: '12 pendientes', icon: Gamepad2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'incidents', label: 'Reportes abiertos', value: '5', trend: '2 críticos', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const pendingApprovals = [
  { id: 'GA-9821', title: 'Cyber Drift', studio: 'Quantum Forge', genre: 'Racing', status: 'En revisión' },
  { id: 'GA-9819', title: 'Forgotten Isles', studio: 'Pixel Bloom', genre: 'Adventure', status: 'QA' },
  { id: 'GA-9818', title: 'Hexa Tactics', studio: 'Mindset Labs', genre: 'Strategy', status: 'Pendiente' },
];

const latestUsers = [
  { id: 1, name: 'María López', email: 'maria@nexus.gg', role: 'ADMIN', status: 'Activo' },
  { id: 2, name: 'Jorge Paez', email: 'jorge@nexus.gg', role: 'MOD', status: 'Pendiente' },
  { id: 3, name: 'Ana Ruiz', email: 'ana@nexus.gg', role: 'USER', status: 'Activo' },
];

export default function AdminDashboard() {
  return (
    <div className="bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Encabezado */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">panel administrativo</p>
            <h1 className="text-4xl font-semibold text-white mt-2">Control central Nexus</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
              Supervisa usuarios, juegos y operaciones clave en una sola vista. Todos los datos se actualizan cada hora.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-semibold hover:bg-slate-100 transition">
              Crear anuncio
            </button>
            <button className="px-6 py-3 border border-slate-700 text-white rounded-2xl font-semibold hover:border-slate-500 transition">
              Configuración
            </button>
          </div>
        </header>

        {/* Métricas */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ id, label, value, trend, icon: Icon, color, bg }) => (
            <div key={id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/20">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={color} size={24} />
              </div>
              <p className="text-sm text-slate-400">{label}</p>
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              <p className="text-sm text-slate-500">{trend}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          {/* Actividad */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-widest">Estado de la plataforma</p>
                <h2 className="text-2xl font-semibold text-white">Monitoreo en tiempo real</h2>
              </div>
              <button className="text-sm text-primary-300 hover:text-primary-200 font-semibold">Ver reportes</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-emerald-400" size={20} />
                  <p className="text-sm text-slate-400">Latencia promedio</p>
                </div>
                <p className="text-3xl font-bold text-white">86 ms</p>
                <p className="text-sm text-emerald-400 mt-1">Estable</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="text-sky-400" size={20} />
                  <p className="text-sm text-slate-400">Seguridad</p>
                </div>
                <p className="text-3xl font-bold text-white">0 incidentes</p>
                <p className="text-sm text-slate-500 mt-1">Últimas 24h</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {pendingApprovals.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950/30">
                  <div>
                    <p className="font-semibold text-white">{game.title}</p>
                    <p className="text-sm text-slate-400">{game.studio} • {game.genre}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-700 text-slate-300">
                    {game.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Usuarios recientes */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-primary-300" size={24} />
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-widest">Equipo</p>
                <h2 className="text-xl font-semibold text-white">Movimientos recientes</h2>
              </div>
            </div>
            <div className="space-y-4">
              {latestUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-800 p-4 bg-slate-950/30">
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400">{user.role}</p>
                    <span className={`text-sm font-medium ${user.status === 'Activo' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 rounded-2xl bg-primary-600 text-white font-semibold hover:bg-primary-500 transition flex items-center justify-center gap-2">
              <TrendingUp size={18} />
              Ver equipo completo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

