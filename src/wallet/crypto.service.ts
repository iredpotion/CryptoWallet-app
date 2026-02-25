import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CryptoService {
  // URL da API Pública da CoinGecko
  private readonly COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';

  // Mapeamento: Símbolo Interno -> ID da CoinGecko
  private readonly tokenMap: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BRL: 'brazilian-real', // Usado apenas para lógica interna
  };

  async getPrice(baseToken: string, targetToken: string): Promise<number> {
    // Se for conversão para a mesma moeda, 1:1
    if (baseToken === targetToken) return 1;

    const baseId = this.tokenMap[baseToken];
    
    // Validação básica de tokens suportados
    if (!baseId || !this.tokenMap[targetToken]) {
      throw new BadRequestException(`Par de moedas não suportado: ${baseToken}-${targetToken}`);
    }

    try {
      // Cenário 1: Crypto para FIAT (ex: BTC -> BRL)
      // A CoinGecko aceita ?ids=bitcoin&vs_currencies=brl
      if (targetToken === 'BRL') {
        const response = await axios.get(this.COINGECKO_URL, {
          params: {
            ids: baseId,
            vs_currencies: 'brl',
          },
        });
        const price = response.data[baseId]?.brl;
        if (!price) throw new Error('Preço não encontrado na resposta da API');
        return price;
      }

      // Cenário 2: FIAT para Crypto (ex: BRL -> BTC)
      // A CoinGecko não dá cotação inversa direta BRL->BTC facilmente na rota simple.
      // Invertemos a lógica: Pegamos quanto vale 1 BTC em BRL e dividimos 1 pelo valor.
      if (baseToken === 'BRL') {
        const targetId = this.tokenMap[targetToken];
        const response = await axios.get(this.COINGECKO_URL, {
          params: {
            ids: targetId,
            vs_currencies: 'brl',
          },
        });
        const priceInBrl = response.data[targetId]?.brl;
        if (!priceInBrl) throw new Error('Preço inverso não encontrado');
        return 1 / priceInBrl;
      }

      // Cenário 3: Crypto para Crypto (ex: BTC -> ETH)
      // Calculamos via BRL como ponte (BTC -> BRL -> ETH) para simplificar sem precisar de API Pro
      const response = await axios.get(this.COINGECKO_URL, {
        params: {
          ids: `${baseId},${this.tokenMap[targetToken]}`,
          vs_currencies: 'brl',
        },
      });
      
      const basePriceBrl = response.data[baseId]?.brl;
      const targetPriceBrl = response.data[this.tokenMap[targetToken]]?.brl;

      if (!basePriceBrl || !targetPriceBrl) throw new Error('Cotação cruzada falhou');
      
      return basePriceBrl / targetPriceBrl;

    } catch (error) {
      console.error('Erro na CoinGecko:', error.message);      
      return this.getMockPrice(baseToken, targetToken);
    }
  }

  private getMockPrice(base: string, target: string): number {
    const pricesInBrl = { BTC: 350000, ETH: 15000, USDT: 5.50, BRL: 1 };
    return pricesInBrl[base] / pricesInBrl[target];
  }
}