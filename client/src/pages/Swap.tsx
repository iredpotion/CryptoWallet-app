import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';

export default function Swap() {
  const [fromToken, setFromToken] = useState('BRL');
  const [toToken, setToToken] = useState('BTC');
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  const swalConfig = { background: '#ffffff', color: '#1a1a1a', confirmButtonColor: '#800020', cancelButtonColor: '#6b7280', backdrop: `rgba(0, 0, 0, 0.4)` };

  const handleExecuteSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      ...swalConfig,
      title: 'Confirmar Transação?',
      text: `Você está convertendo ${amount} ${fromToken} para ${toToken}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await api.post('/wallet/swap', { from: fromToken, to: toToken, amount: Number(amount) });
      await Swal.fire({ ...swalConfig, icon: 'success', title: 'Sucesso!', text: 'Conversão realizada com sucesso!' });
      navigate('/dashboard');
    } catch (err: any) {
      Swal.fire({ ...swalConfig, icon: 'error', title: 'Falha', text: err.response?.data?.message || 'Saldo insuficiente ou erro interno.' });
    }
  };

  const inputStyle = { width: '100%', padding: '14px', backgroundColor: '#f9fafb', color: '#1a1a1a', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' as const };

  return (
    <Layout>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Nova Conversão</h1>
        </div>

        <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <form onSubmit={handleExecuteSwap} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'flex', gap: '25px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px', fontSize: '0.9rem' }}>Ativo Original</label>
                <select value={fromToken} onChange={(e) => setFromToken(e.target.value)} style={inputStyle}>
                  <option value="BRL">BRL</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px', fontSize: '0.9rem' }}>Ativo Destino</label>
                <select value={toToken} onChange={(e) => setToToken(e.target.value)} style={inputStyle}>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="BRL">BRL</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px', fontSize: '0.9rem' }}>Quantidade</label>
              <input type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
            </div>

            <button type="submit" style={{ marginTop: '10px', width: '100%', padding: '16px', backgroundColor: '#800020', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              Converter Agora
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}