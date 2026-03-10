import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { email, password });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/dashboard');
      }
    } catch {
      alert('Erro ao realizar cadastro');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <Logo centered={true} />

        <form onSubmit={handleRegister} className="flex-form" style={{ marginTop: '10px' }}>
          <div className="form-group">
            <label>E-MAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>SENHA</label>
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
            {isLoading ? 'Cadastrando...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Já possui conta? <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 'bold', textDecoration: 'none', pointerEvents: isLoading ? 'none' : 'auto' }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}