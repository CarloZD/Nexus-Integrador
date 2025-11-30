import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Catalog from './pages/Catalog';
import GameDetail from './pages/GameDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Componente para proteger rutas de admin
function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Navbar />

        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/game/:id" element={<GameDetail />} />
          
          {/* Rutas protegidas - requieren login */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de admin - requieren rol ADMIN */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}