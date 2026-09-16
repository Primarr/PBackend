import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentRequest, PaymentReceipt, Transaction, Budget } from './payment.types';
import { randomUUID } from 'crypto';
import { computeFeeBps, isStellarPublicKey } from '../stellar/stellar';

@Injectable()
export class PaymentService {
  private transactions: Map<string, Transaction> = new Map();
  private receipts: Map<string, PaymentReceipt> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private readonly feeBps = Number(process.env.PROTOCOL_FEE_BPS || 20);

  pay(request: PaymentRequest, agentAddress: string): PaymentReceipt {
    if (!isStellarPublicKey(agentAddress)) {
      throw new BadRequestException('from must be a Stellar G… public key');
    }
    if (!isStellarPublicKey(request.to)) {
      throw new BadRequestException('to must be a Stellar G… public key');
    }
    if (!(request.amount > 0)) {
      throw new BadRequestException('amount must be greater than zero');
    }

    const fee = computeFeeBps(request.amount, this.feeBps);
    const txHash = this.generatePendingTxRef();
    const ledger = 0;

    const receipt: PaymentReceipt = {
      txHash,
      ledger,
      settledAt: new Date(),
      from: agentAddress,
      to: request.to,
      amount: request.amount,
      asset: request.asset,
      fee,
      feeBps: this.feeBps,
      status: 'pending_onchain',
    };

    this.receipts.set(txHash, receipt);

    const transaction: Transaction = {
      id: randomUUID(),
      from: agentAddress,
      to: request.to,
      service: request.serviceId || 'unknown',
      amount: request.amount,
      status: 'pending',
      timestamp: new Date(),
      txHash,
      fee,
    };

    this.transactions.set(transaction.id, transaction);
    return receipt;
  }

  getTransactions(limit: number = 10, offset: number = 0): Transaction[] {
    const txArray = Array.from(this.transactions.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
    return txArray.slice(offset, offset + limit);
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getReceipt(txHash: string): PaymentReceipt | undefined {
    return this.receipts.get(txHash);
  }

  configureBudget(agentId: string, budget: Budget): Budget {
    if (budget.sessionCap < 0 || budget.taskCap < 0) {
      throw new BadRequestException('caps must be non-negative');
    }
    if (budget.taskCap > budget.sessionCap) {
      throw new BadRequestException('taskCap cannot exceed sessionCap');
    }
    this.budgets.set(agentId, budget);
    return budget;
  }

  getBudget(agentId: string): Budget | undefined {
    return this.budgets.get(agentId);
  }

  assertWithinBudget(agentId: string, amount: number, kind: 'session' | 'task') {
    const budget = this.budgets.get(agentId);
    if (!budget) return true;
    const cap = kind === 'session' ? budget.sessionCap : budget.taskCap;
    if (amount > cap) {
      throw new BadRequestException('OverBudget: amount exceeds configured cap');
    }
    return true;
  }

  /** Local reference until a Horizon/Soroban submit path attaches a real hash. */
  private generatePendingTxRef(): string {
    return `pending_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }
}
