# NexusFlow Frontend Mock Data Audit

Last updated: 2026-01-31  
Status: 🔴 Multiple hardcoded mocks found

---

## 🚨 Critical Mocks (Should Be Replaced)

### 1. Transaction History (Dashboard)
**Location:** `web/src/app/app/dashboard/page.tsx:71`

**Current:**
```typescript
const txHistory = [
  { hash: "0xabc...123", action: "Rebalance", time: "10 mins ago", status: "Success" },
  { hash: "0xdef...456", action: "Arbitrage", time: "1 hour ago", status: "Success" },
];
```

**Impact:** 🔴 HIGH - Users cannot see their real transactions  
**How to Fix:**
1. Backend stores executed transactions in DB after each action
2. Create API endpoint: `GET /api/agent/transactions`
3. Frontend fetches and displays real transaction history
4. Alternative: Use The Graph or Goldsky to index contract events

---

### 2. KPI Metrics (Dashboard)
**Location:** `web/src/components/KPIBar.tsx:53-55`

**Current:**
```typescript
const totalValueSecured = "$4.2M";
const totalProfitGenerated = "+$12.5k";
```

**Impact:** 🔴 HIGH - Misleading analytics  
**How to Fix:**
- **TVL:** Read from NexusUSD `totalSupply()` or aggregate all user deposits
- **Profit:** Backend calculates cumulative `(targetAPY - sourceAPY) * depositAmount * timePeriod`
- Create API endpoint: `GET /api/analytics/kpi`

---

### 3. Security Sandbox Limits
**Location:** `web/src/components/SecuritySandbox.tsx:10-16`

**Current:**
```typescript
const [limits] = useState({
  dailyLimit: 1000,
  spentToday: 124.50,
  asset: 'USDC',
  whitelist: ['Uniswap V3', 'Aave V3', 'Superchain Bridge', 'Nexus USD'],
  lastAudit: '2 mins ago'
});
```

**Impact:** 🟡 MEDIUM - Misleading security status  
**How to Fix:**
- Read from `NexusDelegation` contract:
  - `tokenDailyLimits(address token)` → dailyLimit
  - `tokenDailySpent(address token)` → spentToday
  - `allowedProtocols(address protocol)` → whitelist
  - `lastPolicyUpdate` → lastAudit
- Use wagmi/viem to call contract view functions

---

### 4. Marketplace APY Badges
**Location:** `web/src/app/app/marketplace/page.tsx:129-136`

**Current:**
```typescript
<APYBadge apy={0.082} />  // Intra-Chain Rebalance
<APYBadge apy={0.125} />  // Cross-Chain Arbitrage
<APYBadge apy={0.452} />  // Degen Liquidity
```

**Impact:** 🟡 MEDIUM - Strategies show fake performance  
**How to Fix:**
- Fetch from backend API: `GET /api/strategies/analytics`
- Backend calculates historical average APY from executed transactions
- For strategies not yet executed, use "Projected: X%" label instead

---

### 5. Arbitrage Opportunities
**Location:** `web/src/components/ArbitrageFlow.tsx:47-58`

**Current:**
```typescript
const mockOpp: ArbitrageOpportunity = {
  type: 'ARBITRAGE',
  sourceChain: 'Base',
  targetChain: 'Optimism',
  token: 'USDC',
  sourceApy: 0.032,
  targetApy: 0.058,
  spread: 0.026,
  description: 'Move USDC from Base (3.2%) to Optimism (5.8%)',
};
```

**Impact:** 🟢 LOW - Already replaced by `/api/agent/stream`  
**Status:** ✅ FIXED - `useOmnichainPerception` hook already uses SSE from backend

---

## 🟢 Acceptable Mocks (Development/Demo Only)

### 6. World ID Proof (Development)
**Location:** `web/src/components/WorldIDVerify.tsx:62-63`

**Current:**
```typescript
proof: '0xmock_proof',
merkle_root: '0xmock_root',
```

**Impact:** ✅ ACCEPTABLE - Bypassed via `NEXT_PUBLIC_BYPASS_WORLDID=true`  
**How to Fix:** Change to `false` and integrate real World ID for production

---

### 7. EIP-7702 Mock Signature
**Location:** `web/src/hooks/use7702.ts:90-91`

**Current:**
```typescript
console.warn('Wallet does not support eth_signDelegation. Using Mock Signature for Demo.');
// Generate a fake but valid-looking signature for the demo flow
```

**Impact:** ✅ ACCEPTABLE - Wallet compatibility fallback  
**Note:** Only used when wallet doesn't support EIP-7702. Should be removed once wallets support the standard.

---

### 8. Paymaster Mock
**Location:** `web/src/app/api/agent/paid/route.ts:27-28`

**Current:**
```typescript
const PAYMASTER_ADDRESS = "0x8888888888888888888888888888888888888888"; // Mock Paymaster
```

**Impact:** ✅ ACCEPTABLE - Gas sponsorship demo  
**How to Fix:** Deploy real Paymaster contract or use x402 protocol's official paymaster

---

## 📊 Summary

| Component | Impact | Status | Priority |
|-----------|--------|--------|----------|
| Transaction History | 🔴 HIGH | ❌ Mock | P0 |
| KPI Metrics (TVL/Profit) | 🔴 HIGH | ❌ Mock | P0 |
| Security Sandbox | 🟡 MEDIUM | ❌ Mock | P1 |
| Marketplace APY | 🟡 MEDIUM | ❌ Mock | P1 |
| Arbitrage Opportunities | 🟢 LOW | ✅ Real | ✅ Done |
| World ID | 🟢 LOW | ⚠️ Bypass | P2 |
| EIP-7702 Signature | 🟢 LOW | ⚠️ Fallback | P3 |
| Paymaster | 🟢 LOW | ❌ Mock | P3 |

---

## 🎯 Implementation Roadmap

### Phase 1: Critical Data (P0)
1. **Transaction History Backend**
   - Add DB schema: `transactions { hash, action, timestamp, status, user }`
   - Store transactions in `agent/executor/*.ts` after execution
   - Create API endpoint: `GET /api/agent/transactions?address=0x...`
   - Update Dashboard to fetch real data

2. **KPI Metrics**
   - Add analytics service in `agent/analytics.ts`
   - Calculate TVL from `NexusUSD.totalSupply()`
   - Calculate profit from stored transaction deltas
   - Create API endpoint: `GET /api/analytics/kpi`

### Phase 2: Security & Performance (P1)
3. **Security Sandbox**
   - Create React hook: `useNexusDelegation(userAddress)`
   - Read contract state via wagmi
   - Update `SecuritySandbox.tsx` to use real data

4. **Marketplace APY**
   - Add strategy analytics to backend
   - Track historical execution performance
   - Update `marketplace/page.tsx` with real averages

### Phase 3: Production Polish (P2-P3)
5. **World ID Integration**
6. **Real Paymaster Contract**

---

## 🔧 Quick Fixes Available Now

### Replace KPI with On-Chain Data (5 min)

```typescript
// web/src/components/KPIBar.tsx
import { useReadContract } from 'wagmi';

export function KPIBar() {
  const { data: totalSupply } = useReadContract({
    address: process.env.NEXT_PUBLIC_SUPERCHAIN_ERC20_BASE_SEPOLIA,
    abi: [{ name: 'totalSupply', type: 'function', stateMutability: 'view', outputs: [{ type: 'uint256' }] }],
    functionName: 'totalSupply',
  });

  const tvl = totalSupply ? `$${(Number(totalSupply) / 1e18).toFixed(2)}` : '—';
  
  return <KPIItem label="TVL Secured" value={tvl} ... />;
}
```

---

## 📝 Notes

- All mock data is clearly marked with comments in the codebase
- Most critical mocks can be replaced within 1-2 days of backend work
- Some mocks (World ID, Paymaster) are acceptable for hackathon/demo purposes
- Priority should be: Transaction History → KPI Metrics → Security Sandbox

