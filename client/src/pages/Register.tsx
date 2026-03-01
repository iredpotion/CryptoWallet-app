import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

// Componente de registro que gerencia a criação de novas contas e o login automático pós-cadastro
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Registra o usuário na API e armazena o token retornado para redirecionamento imediato ao painel
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', { email, password });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/dashboard'); 
      }
    } catch { 
      alert('Erro ao realizar cadastro'); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '50px 40px' }}>
        <Logo centered={true} />
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
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
            Sign up
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Já possui conta? <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 'bold', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}