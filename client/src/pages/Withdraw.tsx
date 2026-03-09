import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Withdraw() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('BRL');
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => { 
    api.get('/wallet').then(res => setWallet(res.data)); 
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 

    setIsLoading(true);
    try {
      await api.post('/wallet/withdraw', { 
        token: token, 
        amount: Number(amount) 
      });
      
      await Swal.fire({ 
        icon: 'success', 
        title: 'Sucesso', 
        text: 'Saque realizado com sucesso!',
        confirmButtonColor: '#0000FF'
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Falha no Saque', 
        text: err.response?.data?.message || 'Saldo insuficiente ou falha na transação.',
        confirmButtonColor: '#0000FF'
      });
      setIsLoading(false); 
    }
  };

  return (
    <Layout>
      <div style={{ padding: '0 15px' }}>
        <div className="card form-container">
          <h2 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--text-main)' }}>Sacar Fundos</h2>
          
          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Moeda da Carteira</label>
              <select value={token} onChange={(e) => setToken(e.target.value)} className="input-field" disabled={isLoading}>
                <option value="BRL">Real (BRL)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
              </select>
              
              {wallet && (
                <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Disponível: {wallet.assets.find((a: any) => a.token === token)?.balance || '0'} {token}
                </span>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Valor do Saque</label>
              <input 
                type="number" 
                step="any" 
                min="0.00000001" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                placeholder="0.00" 
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
                opacity: isLoading ? 0.7 : 1, 
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Processando...' : 'Confirmar Saque'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}