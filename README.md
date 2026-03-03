## 🚀 Crypto Wallet API & Dashboard

Olá! 👋 Esta é a minha entrega para o desafio prático de Programador da Nexus.

Foi construída uma aplicação full-stack de carteira virtual de criptomoedas, permitindo depósitos via webhooks, saques, conversões (swaps) com cotação em tempo real e um Ledger para auditoria de saldos.

Sendo muito transparente: antes de começar este desafio, eu não tinha qualquer conhecimento prévio sobre NestJS, Prisma e Zod. Decidi abraçar este teste não apenas como uma etapa do processo de recrutamento, mas como um verdadeiro desafio pessoal para me autoavaliar. Queria ver como me sairia a absorver, estruturar e aplicar uma stack totalmente nova em poucos dias.

Foi uma semana intensa de muita leitura de documentação, erros, acertos e testes. O resultado é um sistema que construí do zero e do qual me orgulho bastante!

Devido ao tempo investido na curva de aprendizagem destas novas ferramentas e para garantir que o core da aplicação (arquitetura e regras de negócio) ficasse com a melhor qualidade possível, optei por não realizar o deploy da aplicação. Preferi focar-me em entregar um código bem estruturado, limpo e muito fácil de correr localmente.

---
## 🛠 Tecnologias Utilizadas

Backend:
- NestJS
- TypeScript
- PostgreSQL com Prisma ORM (Facilitou muito a modelagem da base de dados)
- Zod (O "segurança" na validação de dados)
- JWT
- Axios

Frontend:
- React.js (Vite) com rotas pelo React Router DOM
- Framer Motion & SweetAlert2 (Para dar aquele toque final na interface)

---
## 📊 Arquitetura

Aqui está um fluxograma de como os dados navegam pelo sistema, desde o clique no Frontend até à base de dados.

```mermaid
graph TD
    classDef user fill:#2ed573,color:#fff,stroke:#333,stroke-width:2px;
    classDef front fill:#0984e3,color:#fff,stroke:#333,stroke-width:2px;
    classDef api fill:#e94560,color:#fff,stroke:#333,stroke-width:2px;
    classDef db fill:#5352ed,color:#fff,stroke:#333,stroke-width:2px;
    classDef ext fill:#e67e22,color:#fff,stroke:#333,stroke-width:2px;
    classDef sys fill:#2f3542,color:#fff,stroke:#e1b12c,stroke-width:2px,stroke-dasharray:5,5;

    %% Atores e Interfaces
    User((Utilizador)):::user --> Dash[Dashboard React]:::front
    Dash --> ViewWallet[Ver Carteira e Saldos]:::front
    Dash --> ViewMarket[Consultar Cotações]:::front
    Dash --> ActionSwap[Realizar Swap]:::front

    %% Consulta de Saldo
    ViewWallet --> APIWallet[GET /wallet]:::api
    APIWallet --> DBWallet[(Tabela Wallet e Assets)]:::db

    %% Cotações e Cache
    ViewMarket --> APIMarket[GET /wallet/market]:::api
    APIMarket --> Cache{Cache Local 60s}:::sys
    Cache -- Válido --> ReturnMarket[Retorna Preços]:::api
    Cache -- Expirado --> FetchCoinGecko[Buscar Cotação]:::sys
    FetchCoinGecko --> APICoinGecko[API CoinGecko]:::ext
    APICoinGecko -.-> Cache

    %% Execução de Swap & Cotação
    ActionSwap --> APIQuote[GET /wallet/swap/quote]:::api
    APIQuote --> APICoinGecko
    APIQuote -- Retorna Taxa e Preço --> ActionSwap
    ActionSwap --> APISwap[POST /wallet/swap]:::api
    APISwap --> ACID[Transação Atómica ACID]:::sys
    ACID --> ValidaSaldo{Validar Saldo}:::sys
    ValidaSaldo -- OK --> CobrarTaxa[Debitar 1.5% Taxa]:::sys
    CobrarTaxa --> DBWallet
    CobrarTaxa --> DBLedger[(Tabela Ledger)]:::db

    %% Webhook de Depósito
    Webhook((Webhook Externo)):::ext --> APIDeposit[POST /webhooks/deposit]:::api
    APIDeposit --> CheckIdemp{Validar idempotencyKey}:::sys
    CheckIdemp -- Existente --> Ignore[Ignorar Duplicado]:::sys
    CheckIdemp -- Nova --> ACID
```
---
## 🧠 Porque escolhi estas ferramentas?

1. NestJS em vez de Fastify

O desafio deixava esta escolha em aberto. O Fastify é fenomenal quando o assunto é performance bruta e velocidade. Porém, como estamos a lidar com uma aplicação financeira (saldos, transações, ledger), a organização do código, a escalabilidade e a manutenção são as prioridades absolutas. Escolhi o NestJS porque ele é altamente "opinativo": praticamente obriga a usar uma arquitetura limpa, separando muito bem as responsabilidades (Controllers, Services, Modules).

2. Validação rigorosa com Zod

Aproveitei o embalo de testar coisas novas para incluir o Zod (que também era opcional). Usei-o para garantir que tudo o que entra na API (principalmente os payloads de depósito do Webhook e os dados de Swap) seja rigorosamente tipado e validado em tempo de execução antes sequer de chegar à regra de negócio. Falta um campo? O Zod barra logo à porta.

3. Cache em Memória (E porquê não Redis)

A API pública da CoinGecko tem um limite de pedidos bastante chato (erro 429 Too Many Requests). O desafio mencionava o Redis como um bónus para fazer esse cache. Cheguei a ponderar utilizá-lo, mas a pensar na experiência de quem for avaliar o projeto (sem exigir que corram containers extras só para isso), decidi implementar um Cache em Memória diretamente no CryptoService. Resolve maravilhosamente bem o problema no escopo do teste e mantém o ambiente de desenvolvimento super simples.

4. O Livro-Caixa (Ledger) e Transações ACID

A tabela WalletStatement é basicamente um extrato bancário intocável. Fiz questão de guardar o balanceBefore e balanceAfter em todas as operações, além de colocar estas lógicas sensíveis dentro de um prisma.$transaction. Se alguém precisar auditar a conta no futuro, é só somar linha por linha. E se a luz falhar a meio de um Swap, a base de dados faz rollback automático e não cria "dinheiro fantasma".

---
## 🚀 Como rodar na sua máquina

Você vai precisar apenas do Node.js e de uma base de dados PostgreSQL rodando localmente.

Passo 1: A Base de Dados

- Na pasta do Backend, crie um ficheiro .env (pode copiar o .env.example) e configure as variáveis:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cryptowallet?schema=public"
JWT_SECRET="um_segredo_qualquer_aqui"
```
- Para subir a base de dados em segundos, basta utilizar o ficheiro docker-compose.yml incluído no projeto. No terminal, execute:
```
docker compose up -d
```
(Se preferir não usar containers, certifique-se de ter um PostgreSQL rodando localmente na porta 5432 com as credenciais do seu .env).


Passo 2: Rodar a API (NestJS)

- No terminal, dentro da pasta do backend (/api):

```
# Instalar dependências
npm install

# Criar as tabelas na sua base de dados
npx prisma migrate dev --name init

# Iniciar a API!
npm run start:dev

```
A API estará disponível em http://localhost:3000.

Passo 3: Rodar o Front (React)

- Abra outro terminal, navegue até a pasta do frontend (/client):
```
# Instalar dependências
npm install

# Iniciar o Frontend!
npm run dev
```


O painel vai abrir no seu navegador (geralmente em http://localhost:5173). Pode criar uma conta lá e explorar a aplicação!

---
## 🔗 Resumo das Rotas (Endpoints)

| Método   | Endpoint             | Descrição                                                                 |
| -------- | -------------------- | ------------------------------------------------------------------------- |
| **POST** | `/auth/register`     | Cria um utilizador novo e inicializa a carteira com saldo zero.           |
| **POST** | `/auth/login`        | Autentica o utilizador e retorna o token JWT.                             |
| **GET**  | `/wallet`            | Retorna o resumo da carteira do utilizador autenticado.                   |
| **GET**  | `/wallet/market`     | Retorna as cotações das moedas via CoinGecko utilizando cache interno.    |
| **GET**  | `/wallet/swap/quote` | Simula a conversão, exibindo as taxas aplicadas (1.5%) e o valor final.   |
| **POST** | `/wallet/swap`       | Realiza a troca entre moedas, validando saldos e gerando os registros.    |
| **POST** | `/wallet/withdraw`   | Realiza o saque de saldo da carteira.                                     |
| **GET**  | `/wallet/statement`  | Retorna o extrato da carteira com paginação (`?page=1&limit=10`).         |
| **POST** | `/webhooks/deposit`  | Simula a entrada de um depósito externo com validação de idempotência.    |

---
Feito com muito café e dedicação! Espero que gostem do resultado.