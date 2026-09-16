export interface PaymentRequest {
  to: string;
  amount: number;
  asset: string;
  memo?: string;
  serviceId?: string;
  from?: string;
}

export interface PaymentReceipt {
  txHash: string;
  ledger: number;
  settledAt: Date;
  from: string;
  to: string;
  amount: number;
  asset: string;
  fee: number;
  feeBps: number;
  status: 'pending_onchain' | 'settled' | 'failed';
}

export interface Service {
  id: string;
  name: string;
  capability: string;
  provider: string;
  payoutAddress: string;
  pricePerCall: number;
  calls: number;
  rating: number;
}

export interface Budget {
  sessionCap: number;
  taskCap: number;
  requireApprovalAbove: number;
  rateLimit?: number;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  service: string;
  amount: number;
  status: 'settled' | 'pending' | 'failed';
  timestamp: Date;
  txHash: string;
  fee?: number;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  lastDelivery?: Date;
  status: 'healthy' | 'failing';
}
