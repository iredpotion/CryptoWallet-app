import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Swap() {
  const [fromToken, setFromToken] = useState('BRL');
  const [toToken, setToToken] = useState('BTC');
  const [amount, setAmount] = useState('');

  const [estimatedOutput, setEstimatedOutput] = useState<number>(0);
  const [isQuoting, setIsQuoting] = useState(false);
  // NOVO: Estado para capturar erros da API na hora de cotar
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [marketData, setMarketData] = useState([
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', priceBRL: 0, change1h: 0, color: '#f59e0b' },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH', priceBRL: 0, change1h: 0, color: '#6366f1' },
    { id: 'USDT', name: 'Tether', symbol: 'USDT', priceBRL: 0, change1h: 0, color: '#10b981' }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const res = await api.get('/wallet/market');
        setMarketData(prev => prev.map(coin => {
          const liveData = res.data.find((d: any) => d.symbol === coin.symbol);
          return liveData ? { ...coin, priceBRL: liveData.price, change1h: liveData.change1h } : coin;
        }));
      } catch (error) {
        console.error("Erro ao buscar dados de mercado.", error);
      }
    };

    fetchLivePrices();
    const intervalId = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Busca a cotação e trata erros
  useEffect(() => {
    const getQuote = async () => {
      const numAmount = Number(amount);
      if (!amount || numAmount <= 0) {
        setEstimatedOutput(0);
        setQuoteError(null);
        return;
      }

      setIsQuoting(true);
      setQuoteError(null); // Limpa erros passados
      try {
        const res = await api.get(`/wallet/swap/quote?from=${fromToken}&to=${toToken}&amount=${numAmount}`);

        // CORREÇÃO AQUI: Tenta acessar o valor de forma segura.
        // Se res.data.swap existir, ele pega de lá. Se não, tenta pegar direto da raiz (res.data).
        const finalValue = res.data?.swap?.estimatedOutput ?? res.data?.estimatedOutput ?? res.data?.amount ?? 0;

        if (finalValue === 0 && res.data) {
          console.warn("Backend retornou sucesso, mas não encontrei o estimatedOutput. Resposta:", res.data);
        }

        setEstimatedOutput(finalValue);

      } catch (error: any) {
        console.error("Erro ao buscar cotação", error);
        setEstimatedOutput(0);
        setQuoteError(error.response?.data?.message || 'Erro de comunicação');
      } finally {
        setIsQuoting(false);
      }
    };

    const timeoutId = setTimeout(() => {
      getQuote();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromToken, toToken, amount]);

  const handleExecuteSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || quoteError) return;

    const confirmResult = await Swal.fire({
      title: 'Confirmar Conversão',
      html: `Deseja realmente trocar <b>${amount} ${fromToken}</b> por aproximadamente <b>${estimatedOutput.toLocaleString('pt-BR', { maximumFractionDigits: 8 })} ${toToken}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      cancelButtonColor: '#e11d48',
      confirmButtonText: 'Sim, confirmar!',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      try {
        await api.post('/wallet/swap', { from: fromToken, to: toToken, amount: Number(amount) });
        Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Sua conversão foi realizada com sucesso.', confirmButtonColor: '#1e3a8a' });
        navigate('/dashboard');
      } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Falha na Conversão', text: error.response?.data?.message || 'Saldo insuficiente ou erro na comunicação.', confirmButtonColor: '#1e3a8a' });
      }
    }
  };

  const icons = {
    up: `<svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z"></path></svg>`,
    down: `<svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z"></path></svg>`
  };

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>

        {/* Tabela de Mercado */}
        <div className="card" style={{ padding: '30px', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '20px' }}>Cotação Atual (BRL)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>#</th>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Coin</th>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Valor em BRL</th>
                <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>1h</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((coin, index) => (
                <tr key={coin.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 10px', color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td style={{ padding: '16px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: coin.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>{coin.symbol.charAt(0)}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{coin.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 10px', fontWeight: '700', color: 'var(--text-main)' }}>R$ {coin.priceBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '16px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: coin.change1h >= 0 ? '#10b981' : '#e11d48', fontWeight: '700', fontSize: '0.9rem' }}>
                      <span dangerouslySetInnerHTML={{ __html: coin.change1h >= 0 ? icons.up : icons.down }} />
                      {Math.abs(coin.change1h).toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formulário de Conversão */}
        <div className="card" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '25px', color: 'var(--text-main)' }}>Converter Ativos</h2>
          <form onSubmit={handleExecuteSwap} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Vender</label>
              <select value={fromToken} onChange={(e) => setFromToken(e.target.value)} className="input-field">
                <option value="BRL">BRL (Real)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="USDT">USDT (Tether)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Comprar</label>
              <select value={toToken} onChange={(e) => setToToken(e.target.value)} className="input-field">
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="USDT">USDT (Tether)</option>
                <option value="BRL">BRL (Real)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Quantidade</label>
              <input type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input-field" />
            </div>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border)', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Você receberá aproximadamente:</p>

              {/* NOVO: Exibe o erro ao invés de 0 BTC */}
              {quoteError ? (
                <p style={{ margin: '5px 0 0 0', color: '#e11d48', fontSize: '1rem', fontWeight: '600' }}>
                  {quoteError}
                </p>
              ) : (
                <h3 style={{ margin: '5px 0 0 0', color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '800' }}>
                  {isQuoting ? 'Calculando...' : `${estimatedOutput.toLocaleString('pt-BR', { maximumFractionDigits: 8 })} ${toToken}`}
                </h3>
              )}

            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isQuoting || !!quoteError}>
              Executar Conversão
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}