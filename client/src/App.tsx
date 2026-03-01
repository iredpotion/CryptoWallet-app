import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Swap from './pages/Swap';
import Statement from './pages/Statement';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';

// Gerencia a árvore de navegação aplicando o componente de segurança em rotas autenticadas
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Envolvendo rotas sensíveis com a proteção de autenticação */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />        
        <Route path="/swap" element={<PrivateRoute><Swap /></PrivateRoute>} />      
        <Route path="/statement" element={<PrivateRoute><Statement /></PrivateRoute>} />
        <Route path="/deposit" element={<PrivateRoute><Deposit /></PrivateRoute>} />
        <Route path="/withdraw" element={<PrivateRoute><Withdraw /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}