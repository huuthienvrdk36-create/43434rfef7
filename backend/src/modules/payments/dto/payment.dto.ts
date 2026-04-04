import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  bookingId: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class ConfirmPaymentDto {
  @IsOptional()
  @IsString()
  transactionId?: string;
}
