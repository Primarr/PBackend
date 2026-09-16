import { Injectable, BadRequestException } from '@nestjs/common';
import { Service } from '../payment/payment.types';
import { isStellarPublicKey } from '../stellar/stellar';

const VALID_A =
  'GDZST3XVCDTUJ76ZAV2HA72KYFL3JCPBHQ4PXESVXHMZQ5MDDG2WXYUP';
const VALID_B =
  'GDQP2KPQGKAJY5TPHFMWECV526QRSRKRHLHDMAGJJAAZKQTXGRLGUAAA';
const VALID_C =
  'GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC';
const VALID_D =
  'GA5ZSEJYB37JRC5RJAALRU6ABMEHJRXCIHXY2H7RO4DUKBPNQIBKXAJH';

@Injectable()
export class RegistryService {
  private services: Map<string, Service> = new Map();

  constructor() {
    this.seedCatalog();
  }

  private seedCatalog() {
    const seed: Service[] = [
      {
        id: 'search-1',
        name: 'Web Search',
        capability: 'web-search',
        provider: 'search-agent',
        payoutAddress: VALID_A,
        pricePerCall: 0.002,
        calls: 1250,
        rating: 4.8,
      },
      {
        id: 'model-1',
        name: 'GPT-4 Inference',
        capability: 'model-inference',
        provider: 'inference-agent',
        payoutAddress: VALID_B,
        pricePerCall: 0.015,
        calls: 450,
        rating: 4.9,
      },
      {
        id: 'analysis-1',
        name: 'Data Analysis',
        capability: 'data-analysis',
        provider: 'analytics-agent',
        payoutAddress: VALID_C,
        pricePerCall: 0.005,
        calls: 320,
        rating: 4.7,
      },
      {
        id: 'code-1',
        name: 'Code Review',
        capability: 'code-review',
        provider: 'review-agent',
        payoutAddress: VALID_D,
        pricePerCall: 0.01,
        calls: 180,
        rating: 4.6,
      },
    ];

    seed.forEach((service) => this.services.set(service.id, service));
  }

  search(params: {
    capability?: string;
    maxPrice?: number;
    asset?: string;
  }): Service[] {
    let results = Array.from(this.services.values());

    if (params.capability) {
      const capability = params.capability;
      results = results.filter((s) =>
        s.capability.toLowerCase().includes(capability.toLowerCase()),
      );
    }

    if (params.maxPrice !== undefined) {
      const maxPrice = params.maxPrice;
      results = results.filter((s) => s.pricePerCall <= maxPrice);
    }

    return results.sort((a, b) => b.rating - a.rating);
  }

  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  publishService(service: Omit<Service, 'id' | 'calls'>): Service {
    if (!isStellarPublicKey(service.payoutAddress)) {
      throw new BadRequestException(
        'payoutAddress must be a Stellar G… public key',
      );
    }
    if (!(service.pricePerCall > 0)) {
      throw new BadRequestException('pricePerCall must be greater than zero');
    }
    const id = 'svc_' + Math.random().toString(36).substring(2, 9);
    const newService: Service = {
      ...service,
      id,
      calls: 0,
    };
    this.services.set(id, newService);
    return newService;
  }

  updateService(id: string, updates: Partial<Service>): Service | undefined {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    if (
      updates.payoutAddress !== undefined &&
      !isStellarPublicKey(updates.payoutAddress)
    ) {
      throw new BadRequestException(
        'payoutAddress must be a Stellar G… public key',
      );
    }
    if (updates.pricePerCall !== undefined && !(updates.pricePerCall > 0)) {
      throw new BadRequestException('pricePerCall must be greater than zero');
    }
    const updated = { ...existing, ...updates };
    this.services.set(id, updated);
    return updated;
  }
}
