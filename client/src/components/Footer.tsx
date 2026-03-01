export default function Footer() {
  return (
    <footer style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
      &copy; {new Date().getFullYear()} CryptoWallet. Todos os direitos reservados.
    </footer>
  );
}