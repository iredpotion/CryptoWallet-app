import { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';

export default function Statement() {
  const [statements, setStatements] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const swalConfig = { background: '#ffffff', color: '#1a1a1a', confirmButtonColor: '#800020', backdrop: `rgba(0, 0, 0, 0.4)` };

  const fetchStatement = async (pageNumber: number) => {
    try {
      const response = await api.get(`/wallet/statement?page=${pageNumber}&limit=10`);
      setStatements(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      Swal.fire({ ...swalConfig, icon: 'error', title: 'Erro', text: 'Não foi possível carregar o extrato do Ledger.' });
    }
  };

  useEffect(() => {
    fetchStatement(page);
  }, [page]);

  const getBadgeColor = (type: string) => {
    if (type === 'DEPOSIT' || type === 'SWAP_IN') return { bg: '#d1fae5', text: '#065f46' };
    if (type === 'SWAP_FEE' || type === 'WITHDRAWAL') return { bg: '#ffe4e6', text: '#9f1239' };
    return { bg: '#fef3c7', text: '#92400e' };
  };

  return (
    <Layout>
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Extrato da Conta</h1>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Data</th>
              <th style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Tipo</th>
              <th style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Token</th>
              <th style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Valor</th>
              <th style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Saldo Final</th>
            </tr>
          </thead>
          <tbody>
            {statements.map((stmt) => {
              const colors = getBadgeColor(stmt.type);
              return (
                <tr key={stmt.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#1a1a1a' }}>{new Date(stmt.createdAt).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: colors.bg, color: colors.text }}>
                      {stmt.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#1a1a1a' }}>{stmt.token}</td>
                  <td style={{ padding: '16px 20px', color: stmt.amount > 0 ? '#10b981' : '#f43f5e', fontWeight: 'bold' }}>
                    {stmt.amount > 0 ? '+' : ''}{Number(stmt.amount).toLocaleString('pt-BR', { maximumFractionDigits: 6 })}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#6b7280' }}>{Number(stmt.balanceAfter).toLocaleString('pt-BR', { maximumFractionDigits: 6 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px' }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Anterior</button>
        <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1a1a1a' }}>Página {page} de {totalPages || 1}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Próxima</button>
      </div>
    </Layout>
  );
}