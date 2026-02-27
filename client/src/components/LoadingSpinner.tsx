export default function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner-core"></div>
      <div className="spinner-orbit"></div>      
      <p className="spinner-text">Sincronizando Wallet...</p> 
    </div>
  );
}