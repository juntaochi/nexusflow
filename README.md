# NexusFlow: Trustless Agentic Economy for the Superchain

> **EIP-7702 + Superchain Interop + x402 + World ID** = The Future of Autonomous, Trustless Agent Economy

NexusFlow is a **Serverless & Trustless** platform enabling AI agents to autonomously manage user funds across the Optimism Superchain with ironclad security, on-chain reputation, and economic sustainability.

It is designed for the **2026 Ethereum x Optimism Hackathon**, showcasing a serverless architecture where all state—including reputation, transaction history, and yield data—lives entirely on-chain or in local client storage. No backend database required.

---

## 🎯 What We Built

### Track A: Autonomous Arbitrage (Serverless)
**Problem**: Liquidity is fragmented. Users manually chase yield.
**Solution**: AI agent monitors on-chain yield rates directly from Smart Contracts (Aave/Compound V2 Mocks) and executes rebalancing via Superchain Interop.
**Tech**: V2 Mocks with on-chain interest accrual + Client-side logic.

### Track B: x402 Strategy Marketplace
**Problem**: AI agents lack revenue models.
**Solution**: Agents offer premium strategies as x402-protected APIs, earning USDC.
**Tech**: x402 Protocol for "Payment for Intelligence".

### Track C: Trustless Identity
**Problem**: How do you trust an AI?
**Solution**: World ID verifies human ownership; ERC-8004 Registry tracks reputation on-chain.

---

## 🏗️ Architecture (Serverless Edition)

```
┌─────────────────┐
│   World ID      │ ← Sybil-resistant human verification
│   Verification  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  AgentRegistry  │◄──│  EIP-7702       │──►│  Client-Side    │
│  (ERC-8004)     │   │  Delegation     │   │  History (Local)│
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Smart Contract│
                    │   Yield Mocks   │
                    │  (Interest V2)  │
                    └─────────────────┘
```

**Key Shift**: We removed the backend PostgreSQL requirement.
- **Profit Calculation**: Derived live from on-chain `balanceOf` vs `principal` reads.
- **Transaction History**: Persisted in browser `localStorage` for privacy and zero-infra deployment.
- **Yield Data**: Real-time on-chain accrual (`block.timestamp` based logic).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry
- Recommended: Base Sepolia & OP Sepolia testnet ETH

### 1. Setup Environment Variables

**Web Frontend** (`web/.env.local`):
```bash
NEXT_PUBLIC_WORLD_APP_ID=app_...
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_AAVE_POOL_BASE_SEPOLIA=0x... # V2 Mock with interest
NEXT_PUBLIC_AAVE_POOL_OP_SEPOLIA=0x...   # V2 Mock with interest
```

### 2. Run the Dapp (Frontend Only)

Since the architecture is serverless, you only need to run the frontend!

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## 📖 User Flow

### Act 1: Identity & Delegation
1. Connect Wallet.
2. Verify via World ID (Sybil resistance).
3. Sign EIP-7702 Delegation to authorize the Agent.

### Act 2: Real-Time Earnings
1. Deposit funds into the **Security Sandbox**.
2. Watch "Real Profit" tick up every second.
   - *Under the hood*: The frontend reads the V2 Smart Contract, which calculates `principal * rate * (now - depositTime)`.
3. No fake numbers. If the blockchain stops, the profit stops.

### Act 3: Autonomous Execution
1. The Agent monitors yield spread between Base and OP.
2. Triggers rebalance transaction when profitable.
3. **Transaction History** is saved locally to your device, preserving privacy.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Contracts** | Solidity + Foundry | EIP-7702 Delegation, SuperchainERC20, V2 Interest Mocks |
| **Frontend** | Next.js + Wagmi | Direct RPC reads, LocalStorage persistence, UI |
| **Identity** | World ID | Human verification |
| **Data** | On-Chain + Local | Zero-backend architecture |

---

## 🎓 Key Innovations

### 1. Serverless "Trustless" Architecture
By removing the backend database, we ensure that **all data displayed comes directly from the chain** or the user's own device. This aligns perfectly with crypto values of self-sovereignty.

### 2. EIP-7702 Session Keys
We use the new EIP-7702 standard to grant temporary, granular permissions to agents without requiring users to migrate to a new smart contract wallet.

### 3. Native Superchain Interop
Assets move between Optimism chains in a single block using the Superchain token standard, enabling instant arbitrage.

---

## 📄 License

MIT

---

**Team**: NexusFlow
**Event**: 2026 Ethereum x Optimism Hackathon
