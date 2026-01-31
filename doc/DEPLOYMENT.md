# NexusFlow Deployment Addresses

Deployed on: 2026-01-31
Deployer Address: `0x5D26552Fe617460250e68e737F2A60eA6402eEA9`

## Base Sepolia (Chain ID: 84532)

### Core Contracts
- **NexusDelegation:** `0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38`
- **AgentRegistry:** `0x619AeC8bB48357D967F06F2d1582592455782B29`
- **NexusUSD (SuperchainERC20):** `0x1A54562813c35151a5e8cF4105221212ad97Bf52`
- **CrosschainBridge:** `0x0f9ab104b1aB9dd5e5eA9b8280ad93147e282Cb0`

### V2 Yield Mocks (On-Chain Interest)
- **MockAavePoolV2:** `0x27f813a82897E80025c20d778e9B888dac386623`
- **MockCometV2:** `0xf7AAba4277056aeD151f597daa0aF3B779f26CD1`

### Explorer Links
- [NexusDelegation](https://sepolia.basescan.org/address/0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38)
- [AgentRegistry](https://sepolia.basescan.org/address/0x619AeC8bB48357D967F06F2d1582592455782B29)
- [MockAavePoolV2](https://sepolia.basescan.org/address/0x27f813a82897E80025c20d778e9B888dac386623)

---

## OP Sepolia (Chain ID: 11155420)

### Core Contracts
- **NexusDelegation:** `0xAeb805427cb9BB4978c0EEf0FBe4bA64549cA85D`
- **AgentRegistry:** `0x00DeFBE21758614CC5C2Ed6EB982E3084B952285`
- **NexusUSD (SuperchainERC20):** `0xaA6B7D1b89B05BEABD2F23baf0110806082D09a5`
- **CrosschainBridge:** `0x3CfdE8a17d24bD93f64A38FC3FAd72C4F6585255`

### V2 Yield Mocks (On-Chain Interest)
- **MockAavePoolV2:** `0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38`
- **MockCometV2:** `0x619AeC8bB48357D967F06F2d1582592455782B29`

### Explorer Links
- [NexusDelegation](https://sepolia-optimism.etherscan.io/address/0xAeb805427cb9BB4978c0EEf0FBe4bA64549cA85D)
- [AgentRegistry](https://sepolia-optimism.etherscan.io/address/0x00DeFBE21758614CC5C2Ed6EB982E3084B952285)
- [MockAavePoolV2](https://sepolia-optimism.etherscan.io/address/0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38)

---

## Deployment Scripts Used

1. `contracts/script/DeploySuperchain.sh` - Core Infrastructure
2. `contracts/script/DeployUpgradedMocks.sh` - V2 Yield Mocks with Interest Accrual

