import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

// Serviço de integração com APIs externas de criptomoedas, gerenciando cotações, cache e fallbacks
@Injectable()
export class CryptoService {
  private readonly COINGECKO_SIMPLE_URL = 'https://api.coingecko.com/api/v3/simple/price';
  private readonly COINGECKO_MARKET_URL = 'https://api.coingecko.com/api/v3/coins/markets';

  private readonly tokenMap: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BRL: 'brazilian-real',
  };

  // Melhorando a taxa de sucesso com Headers que imitam um navegador padrão
  private readonly axiosConfig = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    },
    timeout: 5000
  };

  // Configurações e estado do cache em memória para otimização de requisições e prevenção de rate limits
  private cachedMarketData: any = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 60000;

  private simplePriceCache: Record<string, { price: number; timestamp: number }> = {};
  private readonly SIMPLE_CACHE_TTL = 30000;

  // Calcula a taxa de câmbio entre dois tokens, utilizando cache em memória e cotações cruzadas via BRL
  async getPrice(baseToken: string, targetToken: string): Promise<number> {
    if (baseToken === targetToken) return 1;

    const baseId = this.tokenMap[baseToken];
    if (!baseId || !this.tokenMap[targetToken]) {
      throw new BadRequestException(`Par de moedas não suportado: ${baseToken}-${targetToken}`);
    }

    const cacheKey = `${baseToken}-${targetToken}`;
    const now = Date.now();

    if (this.simplePriceCache[cacheKey] && (now - this.simplePriceCache[cacheKey].timestamp < this.SIMPLE_CACHE_TTL)) {
      return this.simplePriceCache[cacheKey].price;
    }

    try {
      let finalPrice = 0;

      if (targetToken === 'BRL') {
        const response = await axios.get(this.COINGECKO_SIMPLE_URL, {
          ...this.axiosConfig,
          params: { ids: baseId, vs_currencies: 'brl' },
        });
        finalPrice = response.data[baseId]?.brl;
        if (!finalPrice) throw new Error('Preço não encontrado na resposta');
      } else if (baseToken === 'BRL') {
        const targetId = this.tokenMap[targetToken];
        const response = await axios.get(this.COINGECKO_SIMPLE_URL, {
          ...this.axiosConfig,
          params: { ids: targetId, vs_currencies: 'brl' },
        });
        const priceInBrl = response.data[targetId]?.brl;
        if (!priceInBrl) throw new Error('Preço inverso não encontrado na resposta');
        finalPrice = 1 / priceInBrl;
      } else {
        const response = await axios.get(this.COINGECKO_SIMPLE_URL, {
          ...this.axiosConfig,
          params: { ids: `${baseId},${this.tokenMap[targetToken]}`, vs_currencies: 'brl' },
        });
        const basePriceBrl = response.data[baseId]?.brl;
        const targetPriceBrl = response.data[this.tokenMap[targetToken]]?.brl;
        if (!basePriceBrl || !targetPriceBrl) throw new Error('Cotação cruzada falhou');
        finalPrice = basePriceBrl / targetPriceBrl;
      }

      this.simplePriceCache[cacheKey] = { price: finalPrice, timestamp: now };
      return finalPrice;

    } catch (error) {
      // Log detalhado para identificar se é Rate Limit (429) ou erro de conexão
      const status = error.response?.status;
      const data = error.response?.data;
      console.warn(`[CryptoService] Erro ao buscar cotação de ${baseToken}-${targetToken}. Status: ${status || 'N/A'}. Detalhes: ${JSON.stringify(data || error.message)}`);

      if (this.simplePriceCache[cacheKey]) {
        console.log(`[CryptoService] Usando cache expirado de ${cacheKey} como fallback.`);
        return this.simplePriceCache[cacheKey].price;
      }
      console.log(`[CryptoService] Acionando mock estático para ${cacheKey}.`);
      return this.getMockPrice(baseToken, targetToken);
    }
  }

  // Busca dados gerais de mercado para os tokens solicitados, garantindo a entrega via cache ou fallback estático em caso de falha
  async getMarketData(tokens: string[] = ['BTC', 'ETH', 'USDT']) {
    const now = Date.now();

    if (this.cachedMarketData && (now - this.lastFetchTime < this.CACHE_TTL)) {
      return this.cachedMarketData;
    }

    const ids = tokens.map(t => this.tokenMap[t]).filter(Boolean).join(',');

    try {
      const response = await axios.get(this.COINGECKO_MARKET_URL, {
        ...this.axiosConfig,
        params: {
          vs_currency: 'brl',
          ids: ids,
          price_change_percentage: '1h'
        }
      });

      const formattedData = response.data.map((coin: any) => {
        const symbol = Object.keys(this.tokenMap).find(key => this.tokenMap[key] === coin.id);
        return {
          symbol,
          price: coin.current_price,
          // A API do CoinGecko retorna a chave price_change_percentage_1h_in_currency quando o paramêntro é enviado
          change1h: coin.price_change_percentage_1h_in_currency || 0
        };
      });

      this.cachedMarketData = formattedData;
      this.lastFetchTime = Date.now();

      return formattedData;

    } catch (error) {
      // Identificando o real motivo da falha do CoinGecko no log do servidor
      const status = error.response?.status;
      console.warn(`[CryptoService] Erro ao buscar Market Data. Status: ${status || 'N/A'}. Mensagem: ${error.message}`);

      if (this.cachedMarketData) {
        console.log('[CryptoService] Retornando dados do Cache em Memória devido a falha da API externa.');
        return this.cachedMarketData;
      }

      console.log('[CryptoService] Retornando MOCKS estáticos devido a falha total e sem cache.');
      return [
        { symbol: 'BTC', price: 350000, change1h: 0 },
        { symbol: 'ETH', price: 18000, change1h: 0 },
        { symbol: 'USDT', price: 5.50, change1h: 0 }
      ];
    }
  }

  // Fornece valores estáticos de contingência caso a API externa e o cache em memória falhem simultaneamente
  private getMockPrice(base: string, target: string): number {
    const pricesInBrl: Record<string, number> = { BTC: 350000, ETH: 15000, USDT: 5.50, BRL: 1 };
    return pricesInBrl[base] / pricesInBrl[target];
  }
}