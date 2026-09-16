# Primar Backend

NestJS API for **Primar** — agent-to-agent payments settled on Stellar.

## v0.2.0

- `GET /health` pings Horizon (`horizon_ok`, network, degraded status)
- `POST /v1/pay` requires real **G…** `from`/`to` keys (no fake placeholders)
- Protocol fee in basis points on receipts; budget caps enforced before pay
- Registry publish/update validates payout G-strkeys and positive prices
- Seed catalog uses valid Stellar public keys
- Jest coverage for Stellar helpers, payments, and health + GitHub Actions CI

```bash
npm install
npm test
npm run start:dev
```

Default port: `3001`. See `.env.example`. Never commit private keys.
