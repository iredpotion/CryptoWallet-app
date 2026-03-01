import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

// Componente de cabeçalho da aplicação, gerenciando a navegação principal e o logout do usuário
export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // Encerra a sessão do usuário localmente e o redireciona para a tela de login
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Renderiza os links de navegação aplicando o azul marinho original para destacar a rota ativa
  const navItem = (path: string, label: string, icon: string) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path} style={{
        display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
        padding: '8px 16px', borderRadius: '8px',
        background: isActive ? '#1e3a8a' : 'transparent',
        color: isActive ? '#FFFFFF' : '#64748b',
        fontWeight: isActive ? '600' : '500', transition: '0.2s'
      }}>
        <span dangerouslySetInnerHTML={{ __html: icon }} style={{ width: '18px', height: '18px' }} />
        {label}
      </Link>
    );
  };

  // Dicionário de ícones SVG minimalistas utilizados no menu de navegação
  const icons = {
    home: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    profile: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    account: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    settings: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    logout: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
  };

  return (
    <header className="card" style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}><Logo /></Link>
      
      <nav style={{ display: 'flex', gap: '5px' }}>
        {navItem('/dashboard', 'Página Principal', icons.home)}
        {navItem('/profile', 'Meu Perfil', icons.profile)}
        {navItem('/account', 'Segurança', icons.account)}
        {navItem('/settings', 'Opções', icons.settings)}
      </nav>

      <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
        <span dangerouslySetInnerHTML={{ __html: icons.logout }} style={{ width: '18px', height: '18px' }} /> Sair
      </button>
    </header>
  );
}