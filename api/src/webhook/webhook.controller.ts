import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { DepositWebhookDto } from './dto/deposit-webhook.dto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('deposit') // Endpoint exigido 
  @HttpCode(HttpStatus.OK) // Webhooks geralmente esperam 200 OK
  async deposit(@Body() dto: DepositWebhookDto) {
    return this.webhookService.processDeposit(dto);
  }
}