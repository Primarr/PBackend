import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { API_VERSION } from './constants';

jest.mock('./stellar/stellar', () => ({
  getNetwork: () => 'testnet',
  horizonUrl: () => 'https://horizon-testnet.stellar.org',
  pingHorizon: jest.fn(async () => true),
}));

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('root reports current version', () => {
    const body = appController.root();
    expect(body.version).toBe(API_VERSION);
    expect(body.network).toBe('testnet');
  });

  it('health includes horizon_ok', async () => {
    const body = await appController.health();
    expect(body.version).toBe('0.2.0');
    expect(body.horizon_ok).toBe(true);
    expect(body.status).toBe('ok');
  });
});
