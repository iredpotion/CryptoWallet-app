import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Deposit() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('BRL');
  const [isLoading, setIsLoading] = useState(false); // NOVO: Estado de loading
  const navigate = useNavigate();

  useEffect(() => { 
    api.get('/wallet').then(res => setWallet(res.data)); 
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Trava o duplo clique
    
    setIsLoading(true);
    try {
      await api.post('/webhooks/deposit', { 
        userId: wallet.userId, 
        token, 
        amount: Number(amount), 
        idempotencyKey: crypto.randomUUID() 
      });
      
      Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Depósito compensado via Webhook!' });
      navigate('/dashboard');
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha no depósito.' });
      setIsLoading(false); // Libera o botão em caso de erro
    }
  };

  return (
    <Layout>
      <div style={{ padding: '0 15px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '40px auto', padding: 'clamp(20px, 5vw, 40px)', boxSizing: 'border-box' }}>
          <h2 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--text-main)' }}>Depositar Fundos</h2>
          
          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Moeda</label>
              <select value={token} onChange={(e) => setToken(e.target.value)} className="input-field" disabled={isLoading}>
                <option value="BRL">Real (BRL)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Valor</label>
              <input 
                type="number" 
                step="any" 
                min="0.01" 
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
              {isLoading ? 'Processando...' : 'Simular Depósito'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}