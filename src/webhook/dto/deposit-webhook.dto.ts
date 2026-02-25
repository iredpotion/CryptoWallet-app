import { IsString, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class DepositWebhookDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // 

  @IsString()
  @IsNotEmpty()
  token: string; // 

  @IsNumber()
  @IsPositive()
  amount: number; // 

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string; // 
}