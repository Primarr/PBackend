import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { API_VERSION } from './constants';
import {
  getNetwork,
  horizonUrl,
  pingHorizon,
} from './stellar/stellar';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root() {
    return {
      service: 'Primar Backend',
      version: API_VERSION,
      network: getNetwork(),
      horizonUrl: horizonUrl(),
      description: 'Agent-to-agent payment API on Stellar',
    };
  }

  @Get('health')
  async health() {
    const horizonOk = await pingHorizon();
    return {
      status: horizonOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      network: getNetwork(),
      horizon_ok: horizonOk,
      horizon_url: horizonUrl(),
    };
  }
}
