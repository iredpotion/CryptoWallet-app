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
          params: { ids: baseId, vs_currencies: 'brl' },
        });
        finalPrice = response.data[baseId]?.brl;
        if (!finalPrice) throw new Error('Preço não encontrado');
      } else if (baseToken === 'BRL') {
        const targetId = this.tokenMap[targetToken];
        const response = await axios.get(this.COINGECKO_SIMPLE_URL, {
          params: { ids: targetId, vs_currencies: 'brl' },
        });
        const priceInBrl = response.data[targetId]?.brl;
        if (!priceInBrl) throw new Error('Preço inverso não encontrado');
        finalPrice = 1 / priceInBrl;
      } else {
        const response = await axios.get(this.COINGECKO_SIMPLE_URL, {
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
      console.warn(`Erro na CoinGecko (Swap ${cacheKey}):`, error.message);
      
      if (this.simplePriceCache[cacheKey]) return this.simplePriceCache[cacheKey].price;
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
          change1h: coin.price_change_percentage_1h_in_currency || 0
        };
      });

      this.cachedMarketData = formattedData;
      this.lastFetchTime = Date.now();

      return formattedData;

    } catch (error) {
      console.warn('Erro ao buscar Market Data:', error.message);
      
      if (this.cachedMarketData) {
        console.log('Retornando dados do Cache em Memória para evitar quebra da tela.');
        return this.cachedMarketData;
      }

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