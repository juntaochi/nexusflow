# NexusFlow: Trustless Agentic Economy for the Superchain

> **EIP-7702 + Superchain Interop + x402 + World ID** = The Future of Autonomous, Trustless Agent Economy

NexusFlow is a full-stack platform enabling AI agents to autonomously manage user funds across the Optimism Superchain with ironclad security, on-chain reputation, and economic sustainability. It creates a permissionless marketplace where agents can monetize high-value strategies via the **x402 (Payment for Intelligence)** protocol.

---

## 🎯 What We Built

### Track A: Autonomous Arbitrage
**Problem**: Liquidity fragmented across 20+ Superchain networks. Users manually chase yield.  
**Solution**: AI agent monitors live APY rates via Chainlink Oracles and autonomously executes cross-chain rebalancing via Superchain Interop (single-block transfers).

### Track B: x402 Strategy Marketplace
**Problem**: AI agents have no revenue model.  
**Solution**: Agents offer premium strategies (Yield Aggregation, MEV Protection) as x402-protected APIs, earning USDC via per-call or subscription models.

### Track C: Trustless Identity
**Problem**: How do you trust an AI with your money?  
**Solution**: World ID verifies human ownership, while the ERC-8004 registry tracks on-chain reputation and social recovery guardians.

---

## 🏗️ Architecture

```
┌─────────────────┐
│   World ID      │ ← Sybil-resistant human verification
│   Verification  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  AgentRegistry  │◄──│  EIP-7702       │──►│  x402 Services  │
│  (ERC-8004)     │   │  Delegation     │   │  (Marketplace)  │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Arbitrage     │
                    │   Executor      │
                    │  (Superchain)   │
                    └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry
- Testnets: Base Sepolia, Optimism Sepolia

### 1. Setup Environment Variables

**Agent Backend** (`agent/.env`):
```bash
AGENT_PRIVATE_KEY=0x...              # Agent wallet private key
USER_EOA_ADDRESS=0x...                # User's EOA (upgraded via EIP-7702)
OPENAI_API_KEY=sk-...                 # For intent parsing
```

**Web Frontend** (`web/.env.local`):
```bash
NEXT_PUBLIC_WORLD_APP_ID=app_...     # World ID app ID
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...
NEXUSFLOW_TREASURY_ADDRESS=0x...     # x402 payment recipient
```

### 2. Deploy Contracts

```bash
cd contracts
forge build
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast
```

Update contract addresses in environment variables.

### 3. Start Agent Backend

```bash
cd agent
npm install
npm run cron:start  # Start autonomous arbitrage monitor
```

### 4. Start Web Frontend

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## 📖 User Flow

### Act 1: Identity Verification (30s)
1. Connect wallet (MetaMask EOA)
2. Scan World ID QR code
3. Agent registered in ERC-8004 registry
4. UI shows: **"Agent #42 | Reputation: +0 | Owner: Verified ✓"**

### Act 2: EIP-7702 Authorization (45s)
1. Sign EIP-7702 delegation
2. EOA becomes smart account (no migration!)
3. Set limits: **"$1000 daily | Token Limits: 500 USDC | Whitelist: Aave, Compound"**
4. Grant 24-hour session key

### Act 3: Autonomous Execution (60s)
1. Dashboard shows live APY monitoring:
   - Base Aave: 3.2%
   - Optimism Aave: 5.8%
   - **Spread Alert: 2.6%**
2. Agent auto-executes (no user action):
   - Withdraw from Base
   - Cross-chain via Superchain (single block!)
   - Deposit to Optimism
3. Live visualization shows funds flowing
4. Gas sponsored via x402

### Act 4: Strategy Marketplace (30s)
1. Click "Discover Premium Strategies"
2. See agent-offered services:
   - "MEV Protection - 0.01 USDC"
   - "Yield Optimizer - 0.005 USDC"
3. Pay via x402 → Premium strategy executes

### Act 5: Reputation (+1) (15s)
1. After successful arbitrage, upvote Agent #42
2. Reputation: +0 → +1 (on-chain)
3. Badge updates: **"Verified Agent | 1 Positive Signal"**

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Contracts** | Solidity + Foundry | EIP-7702 delegation (with Social Recovery), ERC-8004 registry, SuperchainERC20 |
| **Agent** | AgentKit + LangChain | Intent parsing, autonomous execution, x402 payments |
| **Frontend** | Next.js + Wagmi + Viem | Wallet connection, World ID, real-time visualization |
| **Identity** | World ID | Sybil-resistant human verification |
| **Monetization** | x402 Protocol | Micropayments + gas sponsorship |

---

## 🎓 Key Innovations

### 1. EIP-7702 Session Keys
Traditional account abstraction requires migration to new smart wallet. We let **existing EOAs** temporarily become smart accounts via delegation.

**Code**: `contracts/src/NexusDelegation.sol`

### 2. Atomic Cross-Chain Arbitrage
Traditional bridges take minutes. We use **Superchain Native Interop** for single-block transfers.

**Code**: `agent/executor/arbitrage.ts` & `agent/executor/aggregator.ts`

### 3. Agent-as-a-Service Economy
Agents don't just execute for you—they **offer paid services** to others via x402 and earn USDC.

**Code**: `agent/x402/marketplace.ts`

### 4. On-Chain Reputation System
One World ID = One Agent. Prevents spam. Agents inherit human credibility.

**Code**: `contracts/src/AgentRegistry.sol`

---

## 📚 API Reference

### Agent Actions

```typescript
// Execute arbitrage
agent.executeArbitrage({
  sourceChain: "base",
  targetChain: "optimism",
  amount: "100",
  userEOA: "0x..."
});

// Offer strategy
agent.offerStrategy({
  name: "Premium Yield Optimizer",
  category: "yield",
  priceUSDC: "0.005",
  endpoint: "/api/strategies/yield"
});

// Discover strategies
agent.discoverStrategies({
  category: "mev",
  maxPrice: 0.01,
  verifiedOnly: true
});
```

### x402-Protected Endpoints

**Premium Yield Strategy**: `POST /api/strategies/yield`  
Price: 0.005 USDC  
Returns: AI-curated yield opportunities with risk analysis

**Intra-Chain Aggregator**: `POST /api/strategies/aggregator`  
Price: 0.01 USDC  
Returns: Intra-chain rebalancing opportunities (e.g. Aave -> Moonwell)

**MEV Protection**: `POST /api/strategies/mev`  
Price: 0.01 USDC  
Returns: MEV-resistant transaction routing

---

## 🏆 Hackathon Track Alignment

| Track | Technology | Our Implementation |
|-------|------------|-------------------|
| **Optimism Superchain** | Native Interop + Oracles | Atomic cross-chain arbitrage executor using Chainlink Feeds |
| **Ethereum (EIP-7702)** | Account abstraction | Session keys + delegation |
| **Coinbase (AgentKit)** | Agent framework | Full production agent with x402 |
| **World Chain** | World ID | Sybil-resistant agent registration |

---

## 🔮 Future Roadmap

### Phase 1: Mainnet Launch
- Deploy to Base + OP Mainnet
- Real APY data (Aave API, DeFi Llama)
- Security audit

### Phase 2: Agent Marketplace
- Permissionless agent registry
- Strategy NFTs (agents mint + sell)
- Revenue sharing

### Phase 3: Ecosystem Expansion
- Support all Superchain networks (Zora, Mode, etc.)
- Cross-chain governance
- Mobile app (World ID on mobile)

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built with:
- [Optimism Superchain](https://docs.optimism.io/stack/protocol/superchain)
- [Coinbase AgentKit](https://github.com/coinbase/agentkit)
- [World ID](https://docs.worldcoin.org/id)
- [EIP-7702 Spec](https://eips.ethereum.org/EIPS/eip-7702)
- [Chainlink Data Feeds](https://data.chain.link/)

---

**Team**: NexusFlow  
**Event**: 2026 Ethereum x Optimism Hackathon  
**Demo**: [Video Link]  
**Deployed Contracts**: [Etherscan Links]
