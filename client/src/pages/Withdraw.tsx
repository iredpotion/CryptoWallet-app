import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';

export default function Withdraw() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('BRL');
  const navigate = useNavigate();

  useEffect(() => { 
    api.get('/wallet').then(res => setWallet(res.data)); 
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Payload Corrigido: Enviando apenas o que o Controller espera
      await api.post('/wallet/withdraw', { 
        token: token, 
        amount: Number(amount) 
      });
      
      // 2. Await adicionado: Segura a tela até o usuário clicar em "OK"
      await Swal.fire({ 
        icon: 'success', 
        title: 'Sucesso', 
        text: 'Saque realizado com sucesso!',
        confirmButtonColor: '#1e3a8a'
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Falha no Saque', 
        text: err.response?.data?.message || 'Saldo insuficiente ou falha na transação.',
        confirmButtonColor: '#1e3a8a'
      });
    }
  };

  return (
    <Layout>
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto', padding: '40px' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--text-main)' }}>Sacar Fundos</h2>
        
        <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Moeda da Carteira</label>
            <select value={token} onChange={(e) => setToken(e.target.value)} className="input-field">
              <option value="BRL">Real (BRL)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
            </select>
            
            {/* Opcional: Mostra o saldo disponível para ajudar o usuário */}
            {wallet && (
               <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                 Disponível: {wallet.assets.find((a: any) => a.token === token)?.balance || '0'} {token}
               </span>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Valor do Saque</label>
            <input type="number" step="any" min="0.00000001" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" className="input-field" />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Confirmar Saque
          </button>
        </form>
      </div>
    </Layout>
  );
}