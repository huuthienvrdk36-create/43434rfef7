import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateQuoteDto {
  @IsOptional()
  @IsMongoId()
  vehicleId?: string;

  @IsOptional()
  @IsMongoId()
  requestedServiceId?: string;

  @IsString()
  description: string;

  @IsString()
  city: string;
}
