# NexusFlow Demo Script (Serverless Edition - 3 Minutes)

## Setup (Before Demo)
- [ ] Web frontend running (`npm run dev`)
- [ ] Browser open to `localhost:3000`
- [ ] MetaMask connected to Base Sepolia
- [ ] World ID app ready on phone (or bypass mode enabled)
- [ ] **No Backend Required** (Pure client-side execution)

---

## Opening (15 seconds)

> "Imagine giving your wallet superpowers without migrating to a new address. That's EIP-7702.
>
> Now imagine an AI that watches yield across the Superchain—and moves your funds automatically.
>
> But the best part? **We built this entirely serverless.** No centralized database. All reputation and yield data lives on-chain.
>
> This is **NexusFlow**."

---

## Act 1: Identity & Trust (30 seconds)

**Action**: Connect wallet + World ID verification

1. **Click "Connect Wallet"**
   - Show MetaMask popup
   - Address appears

2. **Click "Verify with World ID"**
   - Scan QR code (or auto-verify in dev mode)
   - ✓ Success animation

3. **Point to UI**:
   ```
   Agent #42 registered
   Reputation: +0 (On-Chain)
   Owner: Verified ✓
   ```

**Talking Points**:
- "One World ID = One Agent. This registry lives on-chain (ERC-8004), not in a private database."

---

## Act 2: EIP-7702 Authorization (45 seconds)

**Action**: Sign delegation and set limits

1. **Click "Authorize Agent"**
   - EIP-7702 popup appears
   - Show parameters:
     ```
     Daily Limit: 000
     Whitelist: Aave V3, Compound V3
     Duration: 24 hours
     ```
   - Click "Sign"

2. **MetaMask Signature**
   - Confirm signature

3. **Point to "Security Sandbox" widget**:
   - Show "Delegation Active" status
   - **Note**: This data is read directly from the `NexusDelegation` smart contract.

**Talking Points**:
- "My EOA just became a smart account. The agent has a session key, but I stay in control."

---

## Act 3: "Real" Yield & Autonomous Execution (60 seconds)

**Action**: Deposit and watch yield tick up

1. **Click "Deposit to Strategy"**
   - Confirm transaction.

2. **Point to "Real Profit" Counter**:
   - Watch it tick up every second: `bash.000012`... `bash.000024`...
   - **Crucial**: "This isn't a fake frontend animation. We are reading the `MockAavePoolV2` contract state live. The contract calculates interest based on `block.timestamp`."

3. **Arbitrage Trigger**:
   - Explain: "The agent sees a higher rate on Optimism."
   - Click "Execute Rebalance".
   - Show funds moving via Superchain Interop.

4. **Transaction History**:
   - Point to the "History" tab.
   - "This history is saved locally in your browser (LocalStorage). We don't store your financial data on our servers."

---

## Act 4: x402 Strategy Marketplace (30 seconds)

**Action**: Show agent-as-a-service economy

1. **Click "Strategy Marketplace" tab**
   - Show list of premium strategies.

2. **Click "MEV Protection"**
   - Pay 0.01 USDC via x402.
   - Execution confirms.

**Talking Points**:
- "Agents can monetize their intelligence. You pay per-execution via x402."

---

## Closing (15 seconds)

> "To recap:
>
> 1. **Trustless**: World ID + On-Chain Registry.
> 2. **Serverless**: V2 Smart Contracts + Local Storage. No backend fragility.
> 3. **Agentic**: EIP-7702 Session Keys.
>
> We built the infrastructure for a truly decentralized agent economy. Thank you."

---

**Success Criteria**:
✓ Judges understand "Serverless" architecture choice.
✓ Judges see "Real Profit" ticking from contract state.
✓ Live cross-chain interaction.
