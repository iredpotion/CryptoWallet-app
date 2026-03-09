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
    return (
      <Link to={path} style={{
        display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
        padding: '8px 16px', borderRadius: '8px',
        background: isActive ? 'var(--primary)' : 'transparent',
        color: isActive ? '#FFFFFF' : 'var(--text-muted)',
        fontWeight: isActive ? '600' : '500', transition: '0.2s',
        whiteSpace: 'nowrap' // Evita que o texto quebre em duas linhas no celular
      }}>
        <span dangerouslySetInnerHTML={{ __html: icon }} style={{ width: '18px', height: '18px' }} />
        {label}
      </Link>
    );
  };

  // Dicionário de ícones SVG enxuto apenas com o necessário
  const icons = {
    home: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    logout: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
  };

  return (
    <header className="card" style={{ 
      padding: '15px 25px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      flexWrap: 'wrap', // Permite que os itens desçam caso a tela seja muito estreita
      gap: '15px'       // Espaçamento seguro entre os itens quando quebram de linha
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>
      
      <nav style={{ display: 'flex', gap: '5px' }}>
        {navItem('/dashboard', 'Página Principal', icons.home)}
      </nav>

      <button onClick={handleLogout} style={{ 
        background: 'transparent', border: 'none', color: 'var(--text-muted)', 
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', 
        fontWeight: '500', padding: '8px' 
      }}>
        <span dangerouslySetInnerHTML={{ __html: icons.logout }} style={{ width: '18px', height: '18px' }} /> Sair
      </button>
    </header>
  );
}