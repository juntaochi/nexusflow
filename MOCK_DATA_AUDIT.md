# NexusFlow Frontend Mock Data Audit

Last updated: 2026-01-31  
Status: 🟢 Critical mocks replaced with real on-chain data

---

## ✅ Fixed Mocks (Real Data Now)

### 1. KPI Metrics - TVL (Dashboard)
**Location:** `web/src/components/KPIBar.tsx`

**Status:** ✅ **FIXED**  
**Implementation:** 
- Reads `totalSupply()` from NexusUSD contracts on both Base Sepolia and OP Sepolia
- Aggregates TVL across both chains
- Displays real-time on-chain data

**Before:**
```typescript
const totalValueSecured = "$4.2M"; // Hardcoded
```

**After:**
```typescript
const { data: baseTVL } = useReadContract({
  address: baseNexusUSD,
  abi: ERC20_ABI,
  functionName: 'totalSupply',
  chainId: 84532,
});
// Aggregates base + op TVL in real-time
```

---

### 2. Security Sandbox Limits
**Location:** `web/src/components/SecuritySandbox.tsx`

**Status:** ✅ **FIXED**  
**Implementation:**
- Created `useNexusDelegation` hook to read contract state
- Reads `tokenDailyLimits`, `tokenDailySpent`, `allowedTargets`
- Displays real permission data from NexusDelegation contract

**Before:**
```typescript
const [limits] = useState({
  dailyLimit: 1000,
  spentToday: 124.50,
  whitelist: ['Uniswap V3', 'Aave V3', ...],
});
```

**After:**
```typescript
const { tokenDailyLimit, tokenDailySpent, whitelist } = useNexusDelegation(delegationAddress, tokenAddress);
// Real-time contract reads
```

---

## 🚨 Remaining Mocks (Still Hardcoded)

### 3. Transaction History (Dashboard)
**Location:** `web/src/app/app/dashboard/page.tsx:71`

**Current:**
```typescript
const txHistory = [
  { hash: "0xabc...123", action: "Rebalance", time: "10 mins ago", status: "Success" },
  { hash: "0xdef...456", action: "Arbitrage", time: "1 hour ago", status: "Success" },
];
```

**Impact:** 🔴 HIGH - Users cannot see their real transactions  
**Priority:** P0  
**How to Fix:**
1. Backend stores executed transactions in DB after each action
2. Create API endpoint: `GET /api/agent/transactions`
3. Frontend fetches and displays real transaction history
4. Alternative: Use The Graph or Goldsky to index contract events

---

### 4. KPI Metrics - Total Profit
**Location:** `web/src/components/KPIBar.tsx`

**Current:**
```typescript
const totalProfitGenerated = "+$12.5k"; // TODO: Replace with real calculation
```

**Impact:** 🟡 MEDIUM - Misleading profit data  
**Priority:** P1  
**How to Fix:**
- Backend calculates cumulative `(targetAPY - sourceAPY) * depositAmount * timePeriod`
- Create API endpoint: `GET /api/analytics/profit`
- Track all arbitrage executions and sum profit deltas

---

### 5. Marketplace APY Badges
**Location:** `web/src/app/app/marketplace/page.tsx:129-136`

**Current:**
```typescript
<APYBadge apy={0.082} />  // Intra-Chain Rebalance
<APYBadge apy={0.125} />  // Cross-Chain Arbitrage
<APYBadge apy={0.452} />  // Degen Liquidity
```

**Impact:** 🟡 MEDIUM - Strategies show fake performance  
**Priority:** P1  
**How to Fix:**
- Fetch from backend API: `GET /api/strategies/analytics`
- Backend calculates historical average APY from executed transactions
- For strategies not yet executed, use "Projected: X%" label instead

---

## ✅ Acceptable Mocks (Development/Demo Only)

### 6. Arbitrage Opportunities
**Location:** `web/src/components/ArbitrageFlow.tsx:47`

**Status:** ✅ **Already using real data via SSE**  
- `useOmnichainPerception` hook connects to `/api/agent/stream`
- Backend reads real APY from deployed MockAavePool and MockComet contracts
- Falls back to simulated data only if RPC fails

---

### 7. World ID Proof
**Location:** `web/src/components/WorldIDVerify.tsx:62-63`

**Status:** ⚠️ **Bypassed for development**  
**Impact:** ✅ ACCEPTABLE - Controlled via `NEXT_PUBLIC_BYPASS_WORLDID=true`  
**Production:** Change to `false` and integrate real World ID

---

### 8. Paymaster Mock
**Location:** `web/src/app/api/agent/paid/route.ts:27-28`

**Status:** ⚠️ **Mock for demo**  
**Impact:** ✅ ACCEPTABLE - Gas sponsorship demo  
**Production:** Deploy real Paymaster contract

---

## 📊 Updated Summary

| Component | Impact | Status | Priority |
|-----------|--------|--------|----------|
| ~~KPI TVL~~ | 🔴 HIGH | ✅ Fixed | ✅ Done |
| ~~Security Sandbox~~ | 🟡 MEDIUM | ✅ Fixed | ✅ Done |
| Transaction History | 🔴 HIGH | ❌ Mock | P0 |
| Total Profit | 🟡 MEDIUM | ❌ Mock | P1 |
| Marketplace APY | 🟡 MEDIUM | ❌ Mock | P1 |
| Arbitrage Data | 🟢 LOW | ✅ Real | ✅ Done |
| World ID | 🟢 LOW | ⚠️ Bypass | P2 |
| Paymaster | 🟢 LOW | ❌ Mock | P3 |

---

## 🎯 Next Steps

### Phase 1: Transaction System (P0) - 6-8 hours
1. Add DB schema for storing transactions
2. Update executors to log transactions after execution
3. Create `/api/agent/transactions` endpoint
4. Update Dashboard to fetch and display real history

### Phase 2: Analytics (P1) - 4-6 hours
1. Implement profit calculation in backend
2. Track strategy performance metrics
3. Create `/api/analytics/` endpoints
4. Update Marketplace and KPIBar

### Phase 3: Production Ready (P2-P3)
1. Real World ID integration
2. Real Paymaster deployment

---

## 🚀 What Changed Today

**Deployed:**
- `useNexusDelegation` hook for reading delegation contract state
- Real TVL calculation from on-chain data
- Real security limits display

**Impact:**
- Users now see accurate TVL across both chains
- Security sandbox shows real permission data
- Reduced misleading mock data by ~40%

**Verified:**
- All changes pass ESLint ✅
- TypeScript compilation successful ✅
- Ready for production testing ✅

