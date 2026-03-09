import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [wallet, setWallet] = useState<any>(null);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, marketRes] = await Promise.all([
          api.get('/wallet'),
          api.get('/wallet/market')
        ]);
        setWallet(walletRes.data);
        setMarketData(marketRes.data);
      } catch (error) {
        window.location.href = '/login';
      }
    };
    fetchData();
  }, []);

  if (!wallet) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;

  const totalBalanceBRL = wallet.assets.reduce((acc: number, asset: any) => {
    if (asset.token === 'BRL') return acc + Number(asset.balance);
    const marketInfo = marketData.find(m => m.symbol === asset.token);
    const price = marketInfo ? Number(marketInfo.price) : 0;
    return acc + (Number(asset.balance) * price);
  }, 0);

  const getCryptoBrand = (token: string) => {
    if (token === 'BTC') return { color: '#f59e0b', name: 'Bitcoin' };
    if (token === 'ETH') return { color: '#6366f1', name: 'Ethereum' };
    if (token === 'USDT') return { color: '#10b981', name: 'Tether' };
    return { color: '#1e3a8a', name: 'Brazilian Real' };
  };

  const icons = {
    dep: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    sac: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
    trans: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
    hist: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    eye: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    eyeOff: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
    arrowUp: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z"></path></svg>`,
    arrowDown: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z"></path></svg>`
  };

  const blurFilter = showBalance ? 'none' : 'blur(8px)';

  return (
    <Layout>
      <div className="card dashboard-header">
        <div className="dashboard-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>Saldo Total:</p>
            <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <span dangerouslySetInnerHTML={{ __html: showBalance ? icons.eye : icons.eyeOff }} style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
          <h1 style={{ color: 'var(--text-main)', fontWeight: '800', filter: blurFilter, transition: 'filter 0.3s ease' }}>
            R$ {totalBalanceBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h1>
        </div>
        
        <div className="action-buttons-grid">
          <Link to="/deposit" className="btn-primary"><span dangerouslySetInnerHTML={{ __html: icons.dep }} style={{width: '18px'}} /> Depositar</Link>
          <Link to="/withdraw" className="btn-outline"><span dangerouslySetInnerHTML={{ __html: icons.sac }} style={{width: '18px'}} /> Sacar</Link>
          <Link to="/swap" className="btn-outline"><span dangerouslySetInnerHTML={{ __html: icons.trans }} style={{width: '18px'}} /> Swap</Link>
          <Link to="/statement" className="btn-outline"><span dangerouslySetInnerHTML={{ __html: icons.hist }} style={{width: '18px'}} /> Histórico</Link>
        </div>
      </div>

      <div className="assets-grid">
        {wallet.assets.map((asset: any) => {
          const brand = getCryptoBrand(asset.token);
          const marketInfo = marketData.find(m => m.symbol === asset.token);
          const currentPrice = marketInfo ? Number(marketInfo.price) : 0;
          const change1h = marketInfo ? Number(marketInfo.change1h) : 0;
          const isUp = change1h >= 0;
          const valBRL = asset.token === 'BRL' ? Number(asset.balance) : (Number(asset.balance) * currentPrice);
          
          return (
            <div key={asset.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: brand.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {asset.token.charAt(0)}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{brand.name}</h3>
                </div>
                {asset.token !== 'BRL' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isUp ? '#10b981' : '#e11d48', fontWeight: '700', fontSize: '0.9rem' }}>
                    <span dangerouslySetInnerHTML={{ __html: isUp ? icons.arrowUp : icons.arrowDown }} style={{ width: '12px', height: '12px' }} />
                    {Math.abs(change1h).toFixed(2)}%
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '25px', filter: blurFilter }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {Number(asset.balance).toLocaleString('pt-BR')} {asset.token}
                </p>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  R$ {valBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <Link to="/swap" style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#f8fafc', color: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>Swap</Link>
                <Link to="/withdraw" style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#f8fafc', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>Sacar</Link>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}