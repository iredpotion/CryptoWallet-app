import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Statement() {
  const [statements, setStatements] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/wallet/statement?page=1&limit=20`).then(res => setStatements(res.data.data));
  }, []);

  return (
    <Layout>
      <div className="card" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '30px' }}>Histórico de Transações</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Data</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Operação</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Ativo</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((stmt) => (
                <tr key={stmt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>{new Date(stmt.createdAt).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{stmt.type}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{stmt.token}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: stmt.amount > 0 ? '#10b981' : '#1e293b' }}>
                    {stmt.amount > 0 ? '+' : ''}{Number(stmt.amount).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}