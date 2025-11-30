import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Catalog from './pages/Catalog';
import GameDetail from './pages/GameDetail';

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
        </Routes>
      </div>
    </Router>
  );
}