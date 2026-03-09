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
      <div style={{ padding: '0 15px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '30px', color: 'var(--text-main)' }}>Histórico de Transações</h2>
          
          <div className="table-responsive">
            <table>
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
                    <td style={{ padding: '15px', color: 'var(--text-main)' }}>
                      {new Date(stmt.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '15px', fontWeight: '500', color: 'var(--text-main)' }}>
                      {stmt.type}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      {stmt.token}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      fontWeight: 'bold', 
                      color: Number(stmt.amount) > 0 ? '#008000' : '#FF0000' 
                    }}>
                      {Number(stmt.amount) > 0 ? '+' : ''}
                      {Number(stmt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}