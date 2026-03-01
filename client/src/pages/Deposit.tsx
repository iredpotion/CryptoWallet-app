import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';

export default function Deposit() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('BRL');
  const navigate = useNavigate();

  useEffect(() => { api.get('/wallet').then(res => setWallet(res.data)); }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/webhooks/deposit', { userId: wallet.userId, token, amount: Number(amount), idempotencyKey: crypto.randomUUID() });
      Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Depósito compensado via Webhook!' });
      navigate('/dashboard');
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha no depósito.' });
    }
  };

  return (
    <Layout>
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto', padding: '40px' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--text-main)' }}>Depositar Fundos</h2>
        <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Moeda</label>
            <select value={token} onChange={(e) => setToken(e.target.value)} className="input-field">
              <option value="BRL">Real (BRL)</option><option value="BTC">Bitcoin (BTC)</option><option value="ETH">Ethereum (ETH)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Valor</label>
            <input type="number" step="any" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" className="input-field" />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Simular Depósito</button>
        </form>
      </div>
    </Layout>
  );
}