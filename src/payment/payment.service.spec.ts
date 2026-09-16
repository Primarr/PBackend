import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  const from = 'GDZST3XVCDTUJ76ZAV2HA72KYFL3JCPBHQ4PXESVXHMZQ5MDDG2WXYUP';
  const to = 'GDQP2KPQGKAJY5TPHFMWECV526QRSRKRHLHDMAGJJAAZKQTXGRLGUAAA';
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
  });

  it('rejects invalid destination keys', () => {
    expect(() =>
      service.pay(
        { to: 'GAVXXX...XXXX', amount: 1, asset: 'USDC' },
        from,
      ),
    ).toThrow(/G… public key/);
  });

  it('records a pending payment with protocol fee', () => {
    const receipt = service.pay(
      { to, amount: 1000, asset: 'USDC', serviceId: 'search-1' },
      from,
    );
    expect(receipt.from).toBe(from);
    expect(receipt.to).toBe(to);
    expect(receipt.fee).toBe(2);
    expect(receipt.status).toBe('pending_onchain');
    expect(receipt.txHash.startsWith('pending_')).toBe(true);
  });

  it('enforces budget caps', () => {
    service.configureBudget('agent-1', {
      sessionCap: 5,
      taskCap: 1,
      requireApprovalAbove: 2,
    });
    expect(() =>
      service.assertWithinBudget('agent-1', 2, 'task'),
    ).toThrow(/OverBudget/);
  });
});
