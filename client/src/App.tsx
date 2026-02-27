import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quote from './pages/Quote';
import Swap from './pages/Swap';
import Statement from './pages/Statement';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas de Autenticação (Sem Header/Footer) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas Protegidas (COM Header/Footer) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/statement" element={<Statement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}