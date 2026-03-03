// Abra a pasta em outro terminal
// Rode 'npm install axios'

const axios = require('axios');

async function testarIdempotencia() {
  const url = 'http://localhost:3000/webhooks/deposit';
  
  // Mesma chave para todas as requisições
  const chaveUnica = 'TX_DEPOSITO_' + Date.now(); 
  
  const payload = {
    userId: "COLOQUE_UM_USER_ID_VALIDO_AQUI", //Atenção aqui!!!!
    token: "BRL",
    amount: 100,
    idempotencyKey: chaveUnica 
  };

  console.log(`Disparando 5 requisições simultâneas com a chave: ${chaveUnica}`);

  // Dispara 5 requisições ao MESMO TEMPO
  const requisicoes = Array(5).fill().map((_, index) => {
    return axios.post(url, payload)
      .then(res => console.log(`[Req ${index + 1}] Sucesso:`, res.data))
      .catch(err => console.log(`[Req ${index + 1}] Falha:`, err.response?.data || err.message));
  });

  await Promise.all(requisicoes);
  console.log("Teste finalizado! Verifique o saldo do usuário no banco, valor esperado: 100.");
}

testarIdempotencia();