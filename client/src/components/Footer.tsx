export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px 20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
        &copy; {new Date().getFullYear()} Crypto Wallet. Todos os direitos reservados.
      </p>
    </footer>
  );
}