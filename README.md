# NexusFlow

> **Short summary (<150 chars):** NexusFlow is an open-source DeFi agent stack using EIP-7702 and ERC-8004 to automate secure cross-chain yield strategies.

NexusFlow is a trust-minimized DeFi automation system built for EasyA Consensus Hackathon delivery.
It combines scoped wallet delegation, on-chain agent identity, and cross-chain execution on the Optimism Superchain.

## EasyA Consensus Hackathon Submission

- Event: EasyA Consensus Hackathon - Hong Kong
- Track: DeFi / Trading infrastructure
- Repository: https://github.com/juntaochi/nexusflow
- Submission form: https://forms.gle/PviFvSBZLmoksjmq8
- Canva slides (required by rules): [NexusFlow Canva Deck](https://www.canva.com/design/DAHBE1wW2pM/zjKP3F3WZkztF9MMI457Rg/edit?utm_content=DAHBE1wW2pM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
- Demo video (required): https://youtu.be/-p6PqZlhz7Q
- Full walkthrough video with audio (required): https://youtu.be/-p6PqZlhz7Q
- Canva slide prompts: `CANVA_SLIDE_PROMPTS.md`

## Full Description

NexusFlow solves a core DeFi problem: users want automated execution but do not want to give away private keys or trust opaque bots.

The system lets users:

1. Verify identity and discover agents through an on-chain registry
2. Authorize constrained execution through EIP-7702-style delegation limits
3. Run cross-chain DeFi actions on Superchain testnets
4. Record execution outcomes as transparent on-chain reputation signals

In practice, the current implementation demonstrates autonomous yield-routing style flows on Base Sepolia and OP Sepolia using deployed contracts and frontend orchestration.

## EasyA Requirement Mapping

1. Build using relevant blockchain technologies  
Status: Done (EIP-7702 delegation model, ERC-8004-style registry, Superchain contracts)

2. Open source and remain open source  
Status: Done (public repository + MIT license)

3. Include short summary (<150 chars)  
Status: Done (see first line of this README)

4. Include full description  
Status: Done (section: Full Description)

5. Include technical description (SDKs + sponsor tech reasoning)  
Status: Done (section: Technical Description)

6. Include Canva presentation link  
Status: Done ([NexusFlow Canva Deck](https://www.canva.com/design/DAHBE1wW2pM/zjKP3F3WZkztF9MMI457Rg/edit?utm_content=DAHBE1wW2pM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton))

7. README must include demo assets + blockchain explanation  
Status: Done (demo links + blockchain explanation included below)

## Pre-existing Code Disclosure (Hackathon Rule Compliance)

Per EasyA rules, we disclose that this submission reuses pre-existing code.

- Official hackathon start reference: Feb 11, 2026, 09:00 HKT
- Pre-existing baseline commit range: `646233896` (2026-01-29) to `5c3846395` (2026-02-02)
- Reused parts from pre-existing work:
  - Initial project scaffolding and package/tooling setup across `contracts/`, `web/`, and `agent/`
  - Early smart contract and frontend foundations used as baseline
  - Standard open-source integrations declared in manifests (e.g. OpenZeppelin, Wagmi, RainbowKit, World ID Kit, x402, LangChain, Coinbase AgentKit)
- Work completed during hackathon window commit range: `dfe5d89e2` to `06f6c957e` (2026-02-11 to 2026-02-12)
- Hackathon-window additions include:
  - x402 integration updates and dashboard improvements
  - Agent Economy dashboard and multi-agent registry updates
  - Final demo, slides, and submission documentation updates

This section is our written disclosure. We will also provide in-person disclosure to organizers per event rules.

## Technical Description

### Sponsor / blockchain technologies used

- Optimism Superchain testnets: Base Sepolia + OP Sepolia
- EIP-7702-compatible delegation model (`NexusDelegation`)
- ERC-8004-style agent identity and reputation model (`AgentRegistry`)
- Superchain token and bridge flow (`NexusUSD`, `CrosschainBridge`)
- World ID integration (`@worldcoin/idkit`)
- x402 tooling (`@x402/core`, `@x402/evm`)

### SDKs and frameworks used

- Smart contracts: Solidity, Foundry, OpenZeppelin
- Frontend: Next.js, React, TypeScript, Wagmi, Viem, RainbowKit
- Agent/backend tooling: Node.js, TypeScript, LangChain, Coinbase AgentKit

### Why these technologies were necessary

- EIP-7702 delegation enables scoped automation without key handover.
- ERC-8004-style registry gives agents identity + auditable reputation.
- Superchain primitives make cross-chain execution testable end-to-end.
- World ID reduces Sybil risk for operator identity.

## How Blockchain Interaction Works

1. User connects wallet in the web app and verifies identity (World ID flow).
2. User configures delegation constraints (time, spend, protocol scope).
3. Contracts enforce allowed actions through `NexusDelegation`.
4. Agent/automation logic reads on-chain rates and executes allowed actions.
5. Results are reflected through on-chain state and registry-linked records.

## Screenshots (UI)

### Dashboard

![NexusFlow dashboard screenshot](doc/reference-agent-page.png)

## Required Demo Assets

The EasyA submission requires all links below in this README:

- Demo video (short pitch demo): https://youtu.be/-p6PqZlhz7Q
- Full repo walkthrough with audio (Loom-style): https://youtu.be/-p6PqZlhz7Q
- Canva deck link: [NexusFlow Canva Deck](https://www.canva.com/design/DAHBE1wW2pM/zjKP3F3WZkztF9MMI457Rg/edit?utm_content=DAHBE1wW2pM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

Walkthrough video should cover:

1. Project architecture and repo structure
2. Local run flow
3. Working demo of core user journey
4. How blockchain interactions are validated (transactions/contracts)
5. Which EasyA submission requirements are satisfied and where

## Deployed Contracts (Current Testnet Addresses)

Source: `doc/DEPLOYMENT.md`

### Base Sepolia (84532)

- NexusDelegation: `0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38`
- AgentRegistry: `0x619AeC8bB48357D967F06F2d1582592455782B29`
- NexusUSD: `0x1A54562813c35151a5e8cF4105221212ad97Bf52`
- CrosschainBridge: `0x0f9ab104b1aB9dd5e5eA9b8280ad93147e282Cb0`

### OP Sepolia (11155420)

- NexusDelegation: `0xAeb805427cb9BB4978c0EEf0FBe4bA64549cA85D`
- AgentRegistry: `0x00DeFBE21758614CC5C2Ed6EB982E3084B952285`
- NexusUSD: `0xaA6B7D1b89B05BEABD2F23baf0110806082D09a5`
- CrosschainBridge: `0x3CfdE8a17d24bD93f64A38FC3FAd72C4F6585255`

## Repository Structure

```text
nexusflow/
  contracts/   Solidity contracts + deployment scripts
  web/         Next.js frontend
  agent/       Agent and automation services
  doc/         Deployment docs and pitch materials
```

## Local Development

### Frontend

```bash
cd web
pnpm install
pnpm dev
```

### Agent service

```bash
cd agent
pnpm install
pnpm dev
```

### Contracts

```bash
cd contracts
forge build
forge test
```

## EasyA Eligibility Checklist

- [x] Uses relevant blockchain technologies
- [x] Open source repository
- [x] Includes short summary (<150 chars)
- [x] Includes full description
- [x] Includes technical description
- [x] Includes screenshot(s) of UI
- [x] Includes blockchain interaction explanation
- [x] Add Canva presentation link (required)
- [x] Add short demo video link (required)
- [x] Add full audio walkthrough video link (required)

## License

MIT
