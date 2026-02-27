import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const swalConfig = { background: '#ffffff', color: '#1a1a1a', confirmButtonColor: '#800020', cancelButtonColor: '#6b7280', backdrop: `rgba(0, 0, 0, 0.4)` };

  const fetchWallet = async () => {
    try {
      const response = await api.get('/wallet');
      setWallet(response.data);
    } catch (error) {
      Swal.fire({ ...swalConfig, icon: 'error', title: 'Sessão Expirada', text: 'Por favor, faça login novamente.' });
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const executeDeposit = async () => {
    const { value: amountStr } = await Swal.fire({
      ...swalConfig, title: 'Simular Depósito', text: 'Digite o valor em BRL a depositar via Webhook:',
      input: 'number', inputAttributes: { min: '0.01', step: 'any' },
      showCancelButton: true, confirmButtonText: 'Confirmar', cancelButtonText: 'Cancelar',
    });

    if (!amountStr) return;
    setLoading(true);
    try {
      await api.post('/webhooks/deposit', { userId: wallet.userId, token: 'BRL', amount: Number(amountStr), idempotencyKey: crypto.randomUUID() });
      Swal.fire({ ...swalConfig, icon: 'success', title: 'Sucesso!', text: 'Depósito realizado na sua conta.' });
      fetchWallet();
    } catch (err) {
      Swal.fire({ ...swalConfig, icon: 'error', title: 'Falha', text: 'Não foi possível concluir o depósito.' });
      setLoading(false);
    }
  };

  const executeWithdraw = async (token: string) => {
    const { value: amountStr } = await Swal.fire({
      ...swalConfig, title: `Sacar ${token}`, text: `Quanto de ${token} deseja sacar?`,
      input: 'number', inputAttributes: { min: '0.00000001', step: 'any' },
      showCancelButton: true, confirmButtonText: 'Sacar', cancelButtonText: 'Cancelar',
    });

    if (!amountStr) return;
    setLoading(true);
    try {
      await api.post('/wallet/withdraw', { token, amount: Number(amountStr) });
      Swal.fire({ ...swalConfig, icon: 'success', title: 'Saque Concluído', text: `Você sacou ${amountStr} ${token} com sucesso.` });
      fetchWallet();
    } catch (err: any) {
      Swal.fire({ ...swalConfig, icon: 'error', title: 'Erro no Saque', text: err.response?.data?.message || 'Saldo insuficiente.' });
      setLoading(false);
    }
  };

  if (loading || !wallet) return <LoadingSpinner />;

  return (
    <Layout>
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Dashboard</h1>
        <button onClick={executeDeposit} style={{ backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e7eb', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          + Add Funds
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        {wallet.assets.map((asset: any) => (
          <div key={asset.id} style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#800020' }}>
                {asset.token.charAt(0)}
              </div>
              <h2 style={{ fontSize: '1.2rem', color: '#1a1a1a', fontWeight: 'bold', margin: 0 }}>{asset.token}</h2>
            </div>
            
            <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', margin: '0 0 25px 0' }}>
              {Number(asset.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
            </p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => executeWithdraw(asset.token)} 
                style={{ flex: 1, backgroundColor: '#800020', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Send
              </button>
              <button 
                style={{ flex: 1, backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Receive
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}