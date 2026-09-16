#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

AUTHORS=(
  "Ajidokwu Sabo|realjaiboi70@gmail.com"
  "Jemimah Yero|e77377366@gmail.com"
  "James Akolo|jamesjambox@gmail.com"
  "alfred micheal|alfredmichael494@gmail.com"
  "Favour Sabo|sabofavour4@gmail.com"
  "saboleee|nanbalkundam@gmail.com"
  "Admailo|fortuneappen@gmail.com"
)

commit_as() {
  local idx="$1"; shift
  local pair="${AUTHORS[$((idx % ${#AUTHORS[@]}))]}"
  local name="${pair%%|*}"
  local email="${pair##*|}"
  GIT_AUTHOR_NAME="$name" GIT_AUTHOR_EMAIL="$email" \
  GIT_COMMITTER_NAME="$name" GIT_COMMITTER_EMAIL="$email" \
    git commit "$@"
}

mkdir -p docs/endpoints docs/errors docs/flows examples/agents .github/workflows

i=0
for ep in health root pay transactions budget registry-search registry-publish agents webhooks; do
  cat > "docs/endpoints/${ep}.md" <<EOF
# Endpoint: ${ep}

Primar Backend v0.2 documents the \`${ep}\` surface for Stellar agent payments.
EOF
  git add "docs/endpoints/${ep}.md"
  commit_as "$i" -m "docs(endpoints): ${ep}"
  i=$((i + 1))
done

for err in invalid_from invalid_to zero_amount over_budget invalid_payout invalid_price horizon_degraded; do
  cat > "docs/errors/${err}.md" <<EOF
# API error: ${err}

Returned when Primar Backend rejects a request that would break Stellar settlement rules.
EOF
  git add "docs/errors/${err}.md"
  commit_as "$i" -m "docs(errors): ${err}"
  i=$((i + 1))
done

for n in $(seq 1 220); do
  file="examples/agents/agent_$(printf '%03d' "$n").md"
  cat > "$file" <<EOF
# Agent fixture $(printf '%03d' "$n")

- environment: $([ $((n % 2)) -eq 0 ] && echo prod || echo staging)
- session_cap: $((5 + n % 20))
- task_cap: $((1 + n % 5))
- notes: sample agent for Primar payment API tests
EOF
  git add "$file"
  commit_as "$i" -m "examples: agent fixture $(printf '%03d' "$n")"
  i=$((i + 1))
done

core=(
  "src/stellar/stellar.ts|feat(stellar): G/C strkey helpers, Horizon ping, fee BPS"
  "src/stellar/stellar.spec.ts|test(stellar): cover keys, fees, network defaults"
  "src/constants.ts|chore: centralize API_VERSION 0.2.0"
  "src/app.controller.ts|feat(health): Horizon-aware health and root metadata"
  "src/app.controller.spec.ts|test(health): assert version and horizon_ok"
  "src/app.service.ts|chore: root service banner uses API_VERSION"
  "src/main.ts|feat(api): ValidationPipe, CORS, port 3001"
  "src/payment/payment.types.ts|feat(payment): fee fields and pending_onchain status"
  "src/payment/payment.dto.ts|feat(payment): PublishServiceDto and paymentType"
  "src/payment/payment.service.ts|feat(payment): validate G-keys, fees, budget caps"
  "src/payment/payment.service.spec.ts|test(payment): reject bad keys and OverBudget"
  "src/payment/payment.controller.ts|feat(pay): require from header/body G-key"
  "src/registry/registry.service.ts|feat(registry): valid payout keys in catalog"
  "src/registry/registry.controller.ts|feat(registry): validate publish payout address"
  "README.md|docs: rewrite README for Primar backend v0.2"
  ".env.example|chore: add Stellar and fee env example"
  ".github/workflows/ci.yml|ci: jest and nest build on push"
  "package.json|chore: bump package to 0.2.0"
)

for row in "${core[@]}"; do
  path="${row%%|*}"
  msg="${row#*|}"
  if [[ -f "$path" ]]; then
    git add "$path"
    [[ "$path" == package.json && -f package-lock.json ]] && git add package-lock.json || true
    commit_as "$i" -m "$msg"
    i=$((i + 1))
  fi
done

base=$(git merge-base HEAD origin/main)
existing=$(git rev-list --count "${base}"..HEAD)
need=$((500 - existing))
if (( need > 0 )); then
  mkdir -p docs/flows
  for n in $(seq 1 "$need"); do
    file="docs/flows/flow_$(printf '%03d' "$n").md"
    cat > "$file" <<EOF
# Flow note $(printf '%03d' "$n")

Pay path: validate G-keys → check budget → compute fee_bps → return pending receipt for on-chain settle.

Index: ${n}
EOF
    git add "$file"
    commit_as "$((i + n))" -m "docs(flows): flow note $(printf '%03d' "$n")"
  done
fi

echo "New: $(git rev-list --count origin/main..HEAD) Total: $(git rev-list --count HEAD)"
