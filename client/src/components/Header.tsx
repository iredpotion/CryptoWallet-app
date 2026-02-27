import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinkStyle = (path: string) => ({
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    color: location.pathname === path ? '#800020' : '#6b7280',
    borderBottom: location.pathname === path ? '2px solid #800020' : '2px solid transparent',
    paddingBottom: '4px',
    transition: 'all 0.3s'
  });

  return (
    <header style={{ backgroundColor: '#ffffff', padding: '15px 0', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <Logo centered={false} />
        </Link>

        <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Dashboard</Link>
          <Link to="/quote" style={navLinkStyle('/quote')}>Cotações</Link>
          <Link to="/swap" style={navLinkStyle('/swap')}>Conversão</Link>
          <Link to="/statement" style={navLinkStyle('/statement')}>Extrato</Link>
          
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: 'transparent', border: '1px solid #800020', borderRadius: '6px', color: '#800020', cursor: 'pointer', marginLeft: '10px' }}>
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}