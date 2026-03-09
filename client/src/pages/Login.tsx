import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 
    
    setIsLoading(true); 
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/dashboard'); 
      }
    } catch { 
      alert('Credenciais inválidas'); 
      setIsLoading(false); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: 'clamp(30px, 5vw, 50px) clamp(20px, 5vw, 40px)', boxSizing: 'border-box' }}>
        <Logo centered={true} />
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>E-MAIL</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="input-field" 
              disabled={isLoading}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>SENHA</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="input-field" 
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading} 
            style={{ 
              marginTop: '10px', 
              padding: '16px',
              opacity: isLoading ? 0.7 : 1, 
              cursor: isLoading ? 'not-allowed' : 'pointer' 
            }}
          >
            {isLoading ? 'Entrando...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Não tem conta? <Link to="/register" style={{ color: '#1e3a8a', fontWeight: 'bold', textDecoration: 'none', pointerEvents: isLoading ? 'none' : 'auto' }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}