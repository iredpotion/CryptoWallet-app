import React from 'react';
import Header from './Header';
import Footer from './Footer';

// Componente de layout base que envolve as páginas, mantendo a estrutura padrão com cabeçalho e rodapé
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="app-container" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <main style={{ flex: 1, padding: '20px 0' }}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}