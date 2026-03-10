import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // Encerra a sessão do usuário localmente e o redireciona para a tela de login
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Renderiza o link de navegação aplicando o azul marinho para destacar a rota ativa
  const navItem = (path: string, label: string, icon: string) => {
    const isActive = location.pathname === path;
    const activeStyle = isActive
      ? { background: 'var(--primary)', color: '#FFFFFF' }
      : { background: 'transparent', color: 'var(--text-muted)' };

    return (
      <Link to={path} className="nav-link" style={activeStyle}>
        <span dangerouslySetInnerHTML={{ __html: icon }} style={{ width: '18px', height: '18px', display: 'flex' }} />
        <span>{label}</span>
      </Link>
    );
  };

  // Dicionário de ícones SVG enxuto apenas com o necessário
  const icons = {
    home: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    logout: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
  };

  return (
    <header className="card header-container">
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>

      <nav className="nav-menu">
        {navItem('/dashboard', 'Página Principal', icons.home)}
      </nav>

      <button onClick={handleLogout} className="nav-link" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}>
        <span dangerouslySetInnerHTML={{ __html: icons.logout }} style={{ width: '18px', height: '18px', display: 'flex' }} /> <span>Sair</span>
      </button>
    </header>
  );
}