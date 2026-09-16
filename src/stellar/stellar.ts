export type StellarNetwork = 'testnet' | 'public';

const STELLAR_ACCOUNT = /^G[A-Z2-7]{55}$/;
const STELLAR_CONTRACT = /^C[A-Z2-7]{55}$/;

export function getNetwork(): StellarNetwork {
  const value = (process.env.STELLAR_NETWORK || 'testnet').toLowerCase();
  return value === 'public' || value === 'mainnet' ? 'public' : 'testnet';
}

export function horizonUrl(network: StellarNetwork = getNetwork()): string {
  if (process.env.STELLAR_HORIZON_URL) return process.env.STELLAR_HORIZON_URL;
  return network === 'public'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';
}

export function isStellarPublicKey(value: string): boolean {
  return Boolean(value) && STELLAR_ACCOUNT.test(value.trim());
}

export function isStellarContractId(value: string): boolean {
  return Boolean(value) && STELLAR_CONTRACT.test(value.trim());
}

export async function pingHorizon(timeoutMs = 2500): Promise<boolean> {
  const url = `${horizonUrl().replace(/\/$/, '')}/`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function computeFeeBps(amount: number, feeBps: number): number {
  if (amount <= 0 || feeBps < 0) return 0;
  return Math.floor((amount * feeBps) / 10_000);
}
