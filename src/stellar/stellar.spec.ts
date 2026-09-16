import {
  isStellarContractId,
  isStellarPublicKey,
  computeFeeBps,
  horizonUrl,
  getNetwork,
} from './stellar';

describe('stellar helpers', () => {
  const valid =
    'GDZST3XVCDTUJ76ZAV2HA72KYFL3JCPBHQ4PXESVXHMZQ5MDDG2WXYUP';

  it('accepts G-strkey public keys', () => {
    expect(isStellarPublicKey(valid)).toBe(true);
  });

  it('rejects short or invalid keys', () => {
    expect(isStellarPublicKey('GAVXXX...XXXX')).toBe(false);
    expect(isStellarPublicKey('GBSEARCH123456789')).toBe(false);
    expect(isStellarPublicKey('')).toBe(false);
  });

  it('validates C-strkey contract ids', () => {
    expect(
      isStellarContractId(
        'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4',
      ),
    ).toBe(true);
    expect(isStellarContractId(valid)).toBe(false);
  });

  it('computes protocol fee in basis points', () => {
    expect(computeFeeBps(1000, 20)).toBe(2);
    expect(computeFeeBps(10_000, 100)).toBe(100);
    expect(computeFeeBps(0, 20)).toBe(0);
  });

  it('defaults to testnet horizon', () => {
    expect(getNetwork()).toBe('testnet');
    expect(horizonUrl('testnet')).toContain('horizon-testnet');
  });
});
