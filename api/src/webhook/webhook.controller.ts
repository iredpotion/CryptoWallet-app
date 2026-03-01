import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { DepositWebhookDto } from './dto/deposit-webhook.dto';

// Controlador responsável por receber e rotear eventos assíncronos de sistemas externos
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  // Processa notificações de depósitos recebidos para atualização de saldo na carteira
  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  async deposit(@Body() dto: DepositWebhookDto) {
    return this.webhookService.processDeposit(dto);
  }
}