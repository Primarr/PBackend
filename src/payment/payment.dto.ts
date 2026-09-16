import { IsString, IsNumber, IsOptional, Min, IsIn } from 'class-validator';

export class PaymentDto {
  @IsString()
  to: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsNumber()
  @Min(0.000001)
  amount: number;

  @IsString()
  asset: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsIn(['session', 'task'])
  paymentType?: 'session' | 'task';
}

export class BudgetDto {
  @IsNumber()
  @Min(0)
  sessionCap: number;

  @IsNumber()
  @Min(0)
  taskCap: number;

  @IsNumber()
  @Min(0)
  requireApprovalAbove: number;

  @IsOptional()
  @IsNumber()
  rateLimit?: number;
}

export class PublishServiceDto {
  @IsString()
  name: string;

  @IsString()
  capability: string;

  @IsString()
  payoutAddress: string;

  @IsNumber()
  @Min(0.000001)
  pricePerCall: number;

  @IsOptional()
  @IsString()
  provider?: string;
}
