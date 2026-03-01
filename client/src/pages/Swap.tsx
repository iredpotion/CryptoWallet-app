import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';

export default function Swap() {
  const [fromToken, setFromToken] = useState('BRL');
  const [toToken, setToToken] = useState('BTC');
  const [amount, setAmount] = useState('');
  
  const [marketData, setMarketData] = useState([
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', priceBRL: 0, change1h: 0, color: '#f59e0b' },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH', priceBRL: 0, change1h: 0, color: '#6366f1' },
    { id: 'USDT', name: 'Tether', symbol: 'USDT', priceBRL: 0, change1h: 0, color: '#10b981' }
  ]);

  const navigate = useNavigate();

  // Busca os dados REAIS da nova rota do backend a cada 60 segundos
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const res = await api.get('/wallet/market');
        
        setMarketData(prev => prev.map(coin => {
          // Procura a moeda correspondente no retorno da API
          const liveData = res.data.find((d: any) => d.symbol === coin.symbol);
          if (liveData) {
            return { 
              ...coin, 
              priceBRL: liveData.price, 
              change1h: liveData.change1h 
            };
          }
          return coin;
        }));
      } catch (error) {
        console.error("Erro ao buscar dados de mercado.", error);
      }
    };

    fetchLivePrices(); 
    const intervalId = setInterval(fetchLivePrices, 60000); // Atualiza a cada 60s

    return () => clearInterval(intervalId);
  }, []);

  const handleExecuteSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallet/swap', { from: fromToken, to: toToken, amount: Number(amount) });
      Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Conversão realizada com sucesso!', confirmButtonColor: '#1e3a8a' });
      navigate('/dashboard');
    } catch {
      Swal.fire({ icon: 'error', title: 'Falha', text: 'Saldo insuficiente ou erro na conversão.', confirmButtonColor: '#1e3a8a' });
    }
  };

  const icons = {
    star: `<svg width="16" height="16" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    up: `<svg width="14" height="14" fill="#10b981" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z"></path></svg>`,
    down: `<svg width="14" height="14" fill="#ef4444" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z"></path></svg>`
  };

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* SEÇÃO 1: Tabela de Mercado Simplificada e REAL */}
        <div className="card" style={{ padding: '30px', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '20px' }}>Cotação Atual (BRL)</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', width: '40px' }}>#</th>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Moeda</th>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Preço</th>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>1 h</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((coin, index) => (
                <tr key={coin.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  
                  <td style={{ padding: '16px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <span dangerouslySetInnerHTML={{ __html: icons.star }} style={{ cursor: 'pointer' }} />
                      {index + 1}
                    </div>
                  </td>

                  <td style={{ padding: '16px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: coin.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        {coin.symbol.charAt(0)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{coin.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>{coin.symbol}</span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px 10px', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    {coin.priceBRL > 0 ? `R$ ${coin.priceBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Carregando...'}
                  </td>

                  <td style={{ padding: '16px 10px', fontWeight: '600', fontSize: '0.9rem', color: coin.change1h >= 0 ? '#10b981' : '#ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span dangerouslySetInnerHTML={{ __html: coin.change1h >= 0 ? icons.up : icons.down }} />
                      {Math.abs(coin.change1h).toFixed(2)}%
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SEÇÃO 2: Formulário de Conversão */}
        <div className="card" style={{ padding: '30px', width: '100%' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '25px', color: 'var(--text-main)' }}>Converter Ativos</h2>
          
          <form onSubmit={handleExecuteSwap} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Vender</label>
              <select value={fromToken} onChange={(e) => setFromToken(e.target.value)} className="input-field">
                <option value="BRL">BRL (Real)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="USDT">USDT (Tether)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-10px 0', zIndex: 1 }}>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
            </div>

            <div style={{ marginTop: '-10px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Comprar</label>
              <select value={toToken} onChange={(e) => setToToken(e.target.value)} className="input-field">
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="USDT">USDT (Tether)</option>
                <option value="BRL">BRL (Real)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Quantidade a Vender</label>
              <input type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input-field" />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '15px' }}>Executar Conversão</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}