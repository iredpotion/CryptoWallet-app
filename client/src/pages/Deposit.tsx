import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import Layout from '../components/Layout';

// Componente responsável por renderizar a interface de depósito e simular a entrada de fundos via Webhook
export default function Deposit() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('BRL');
  const navigate = useNavigate();

  // Busca os dados da carteira do usuário autenticado para vincular o depósito ao seu respectivo ID
  useEffect(() => { 
    api.get('/wallet').then(res => setWallet(res.data)); 
  }, []);

  // Intercepta a submissão do formulário e dispara a requisição de depósito para o endpoint de Webhook
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Simular Depósito
          </button>
        </form>
      </div>
    </Layout>
  );
}