import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  Headers,
} from '@nestjs/common';
import type { PaymentReceipt, Transaction } from './payment.types';
import { PaymentService } from './payment.service';
import { PaymentDto, BudgetDto } from './payment.dto';
import { isStellarPublicKey } from '../stellar/stellar';

@Controller('v1')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('pay')
  pay(
    @Body() paymentDto: PaymentDto,
    @Headers('x-stellar-address') headerFrom?: string,
  ): PaymentReceipt {
    const from = paymentDto.from || headerFrom;
    if (!from || !isStellarPublicKey(from)) {
      throw new BadRequestException(
        'from must be provided as a Stellar G… public key (body.from or x-stellar-address)',
      );
    }
    if (!isStellarPublicKey(paymentDto.to)) {
      throw new BadRequestException('to must be a Stellar G… public key');
    }
    if (paymentDto.amount <= 0) {
      throw new BadRequestException('amount must be greater than zero');
    }

    const kind = paymentDto.paymentType || 'task';
    if (paymentDto.serviceId) {
      this.paymentService.assertWithinBudget(
        paymentDto.serviceId,
        paymentDto.amount,
        kind,
      );
    }

    return this.paymentService.pay(paymentDto, from);
  }

  @Get('transactions')
  getTransactions(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Transaction[] {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 100) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.paymentService.getTransactions(limitNum, offsetNum);
  }

  @Get('transactions/:id')
  getTransaction(@Param('id') id: string): Transaction {
    const transaction = this.paymentService.getTransaction(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  @Put('budget/:agentId')
  configureBudget(
    @Param('agentId') agentId: string,
    @Body() budgetDto: BudgetDto,
  ) {
    const budget = this.paymentService.configureBudget(agentId, budgetDto);
    return {
      agentId,
      budget,
      message: 'Budget configured',
      enforced: 'session/task caps checked on POST /v1/pay',
    };
  }
}
