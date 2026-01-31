# NexusFlow Deployment Addresses

Deployed on: 2026-01-31  
Deployer Address: `0x5D26552Fe617460250e68e737F2A60eA6402eEA9`

## Base Sepolia (Chain ID: 84532)

### Core Contracts
- **NexusDelegation:** `0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38`
- **AgentRegistry:** `0x619AeC8bB48357D967F06F2d1582592455782B29`
- **NexusUSD (SuperchainERC20):** `0x1A54562813c35151a5e8cF4105221212ad97Bf52`
- **CrosschainBridge:** `0x0f9ab104b1aB9dd5e5eA9b8280ad93147e282Cb0`

### Mock Yield Protocols
- **MockAavePool:** `0x27f813a82897E80025c20d778e9B888dac386623`
- **MockComet:** `0xf7AAba4277056aeD151f597daa0aF3B779f26CD1`

### Explorer Links
- [NexusDelegation](https://sepolia.basescan.org/address/0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38)
- [AgentRegistry](https://sepolia.basescan.org/address/0x619AeC8bB48357D967F06F2d1582592455782B29)
- [NexusUSD](https://sepolia.basescan.org/address/0x1A54562813c35151a5e8cF4105221212ad97Bf52)
- [CrosschainBridge](https://sepolia.basescan.org/address/0x0f9ab104b1aB9dd5e5eA9b8280ad93147e282Cb0)

---

## OP Sepolia (Chain ID: 11155420)

### Core Contracts
- **NexusDelegation:** `0xAeb805427cb9BB4978c0EEf0FBe4bA64549cA85D`
- **AgentRegistry:** `0x00DeFBE21758614CC5C2Ed6EB982E3084B952285`
- **NexusUSD (SuperchainERC20):** `0xaA6B7D1b89B05BEABD2F23baf0110806082D09a5`
- **CrosschainBridge:** `0x3CfdE8a17d24bD93f64A38FC3FAd72C4F6585255`

### Mock Yield Protocols
- **MockAavePool:** `0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38`
- **MockComet:** `0x619AeC8bB48357D967F06F2d1582592455782B29`

### Explorer Links
- [NexusDelegation](https://sepolia-optimism.etherscan.io/address/0xAeb805427cb9BB4978c0EEf0FBe4bA64549cA85D)
- [AgentRegistry](https://sepolia-optimism.etherscan.io/address/0x00DeFBE21758614CC5C2Ed6EB982E3084B952285)
- [NexusUSD](https://sepolia-optimism.etherscan.io/address/0xaA6B7D1b89B05BEABD2F23baf0110806082D09a5)
- [CrosschainBridge](https://sepolia-optimism.etherscan.io/address/0x3CfdE8a17d24bD93f64A38FC3FAd72C4F6585255)

---

## Key Features

### NexusDelegation (EIP-7702)
- Session key management with expiry
- Token daily limits (granular spend control)
- Social recovery mechanism
- Delegate execution for agents

### AgentRegistry (ERC-8004)
- Agent identity NFTs
- On-chain reputation system
- Pausable for emergency stops
- Two-step ownership transfer

### NexusUSD (SuperchainERC20)
- Native cross-chain transfers via Superchain Interop
- Burn on source chain, mint on destination
- L2ToL2CrossDomainMessenger integration

### CrosschainBridge
- Coordinates cross-chain token transfers
- Integrates with L2ToL2CrossDomainMessenger
- Automatic burn/mint logic

---

## Deployment Scripts Used

1. `script/DeploySuperchain.s.sol` - Core contracts (Delegation, Registry, NexusUSD, Bridge)
2. `script/DeployYieldMocks.s.sol` - Mock Aave and Compound for testing

---

## Next Steps

1. ✅ Update environment variables in `web/.env.local` and `agent/.env`
2. ⏳ Test frontend connection to deployed contracts
3. ⏳ Initialize MockAavePool and MockComet with sample rates
4. ⏳ Fund NexusUSD with initial liquidity for testing
5. ⏳ Test cross-chain bridge functionality
6. ⏳ Deploy to mainnet (Base + OP mainnet)
