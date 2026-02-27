import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import Logo from '../components/Logo';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const swalConfig = { background: '#ffffff', color: '#1a1a1a', confirmButtonColor: '#800020', backdrop: `rgba(0, 0, 0, 0.4)` };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password });
      await Swal.fire({ ...swalConfig, icon: 'success', title: 'Bem-vindo!', text: 'Conta criada com sucesso! Faça login.' });
      navigate('/login');
    } catch (err: any) {
      Swal.fire({ ...swalConfig, icon: 'error', title: 'Erro', text: 'Erro ao criar conta. O e-mail pode já estar em uso.' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '50px 40px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
        <Logo centered={true} />
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' }}>E-MAIL</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                   style={{ width: '100%', padding: '14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' }}>SENHA</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                   style={{ width: '100%', padding: '14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '14px', backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            Sign Up
          </button>
        </form>
        
        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280' }}>
          Já tem conta? <Link to="/login" style={{ color: '#800020', fontWeight: 'bold', textDecoration: 'none' }}>Faça Login</Link>
        </p>
      </div>
    </div>
  );
}