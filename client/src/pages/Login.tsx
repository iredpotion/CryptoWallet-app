import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

// Componente de autenticação que gerencia o acesso do usuário e o armazenamento do token de sessão
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Envia as credenciais para a API e armazena o token JWT no localStorage em caso de sucesso
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/dashboard'); 
      }
    } catch { 
      alert('Credenciais inválidas'); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '50px 40px' }}>
        <Logo centered={true} />
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
              E-MAIL
            </label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="input-field" 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
              SENHA
            </label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="input-field" 
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '16px' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Não tem conta? <Link to="/register" style={{ color: '#1e3a8a', fontWeight: 'bold', textDecoration: 'none' }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}