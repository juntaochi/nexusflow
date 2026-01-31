# NexusFlow Production Frontend

## TL;DR

> **Quick Summary**: Build a production-ready, futuristic frontend for NexusFlow with 3 switchable visual themes (Cyberpunk, Glassmorphism, Minimalist), 3D visualizations, and full integration with existing smart contracts for agent management, yield tracking, and cross-chain operations.
> 
> **Deliverables**:
> - Next.js 14 app with App Router in `web/`
> - Dynamic Theme Engine (3 themes with 3D scene switching)
> - Wallet integration (MetaMask, WalletConnect, Coinbase)
> - World ID verification flow
> - Agent registration/management UI
> - Real-time yield dashboard with 3D particles
> - Transaction history (localStorage)
> - Delegation management panel
> - Playwright E2E test suite
> 
> **Estimated Effort**: XL (Production-grade)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 5 → Task 8 → Task 14

---

## Context

### Original Request
User requested a brand new, intuitive, and futuristic frontend built from scratch for the NexusFlow project. The `web/` directory is currently empty.

### Interview Summary
**Key Discussions**:
- **Visual Style**: User wants ALL THREE themes (Cyberpunk, Glassmorphism, Minimalist) with a dynamic switcher. Cyberpunk is the default.
- **3D Elements**: Essential requirement. Superchain Globe and Yield Particles visualizations required.
- **Scope**: Full production, NOT MVP. All features must be implemented.
- **Wallets**: MetaMask + WalletConnect + Coinbase Wallet (via RainbowKit).
- **Testing**: Playwright for automated UI verification.
- **3D Fallback**: Show error message for unsupported browsers (no 2D fallback).

**Research Findings**:
- Project is "Serverless & Trustless" - NO backend database. All state = On-chain + localStorage.
- Chains: Base Sepolia (84532), OP Sepolia (11155420).
- Key contracts: `AgentRegistry.sol`, `MockAavePoolV2.sol`, `NexusDelegation.sol`.
- Env var pattern: `NEXT_PUBLIC_*` prefix for client-exposed variables.

### Metis Review
**Identified Gaps** (addressed):
- MVP vs Production scope: RESOLVED - User confirmed full production.
- Wallet support: RESOLVED - All 3 wallets via RainbowKit.
- 3D fallback: RESOLVED - Error message only.
- ABI sharing: Will copy from `contracts/out/` after `forge build`.

---

## Work Objectives

### Core Objective
Build a production-ready Next.js frontend with futuristic 3D visuals, dynamic theming, and full smart contract integration for the NexusFlow trustless agent platform.

### Concrete Deliverables
- `web/` directory with complete Next.js 14 App Router application
- 3 visual themes with real-time switching (including 3D backgrounds)
- Wallet connection supporting MetaMask, WalletConnect, Coinbase Wallet
- World ID SDK integration for human verification
- Agent registration and management interface
- Real-time yield dashboard reading from MockAavePoolV2
- localStorage-based transaction history
- EIP-7702 delegation management panel
- Arbitrage trigger interface
- Playwright test suite

### Definition of Done
- [x] `npm run dev` starts the app at localhost:3000
- [x] Theme switcher cycles through all 3 themes with visible 3D background changes
- [x] Wallet connects successfully with any of the 3 supported wallets
- [x] World ID verification flow completes (mock or real depending on env)
- [x] Agent can be registered and viewed in UI
- [x] Yield dashboard shows live-updating profit from contract reads
- [x] Transaction history persists across page refreshes
- [x] Delegation panel shows current session keys and limits
- [x] All Playwright tests pass

### Must Have
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS + CSS variables for theming
- Framer Motion for animations
- React Three Fiber for 3D
- Wagmi v2 + RainbowKit for wallet
- Zustand for client state
- Playwright for testing

### Must NOT Have (Guardrails)
- NO backend server or database
- NO server-side API routes that store state
- NO hardcoded contract addresses (use env vars)
- NO mock data for yield display (must read real contract state)
- NO 2D fallback for 3D scenes (error message instead)
- NO excessive abstraction in initial build
- NO over-engineered component library

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (new project)
- **User wants tests**: YES (Playwright)
- **Framework**: Playwright for E2E browser automation

### Playwright Test Strategy

Each feature will have corresponding Playwright tests that:
1. Navigate to the relevant page/component
2. Perform user interactions (clicks, inputs)
3. Assert expected DOM state and visual changes
4. Capture screenshots as evidence

**Test Setup Task (Task 2)** will:
- Install Playwright
- Configure `playwright.config.ts`
- Create test utilities for wallet mocking
- Verify setup with a basic navigation test

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Next.js Project Scaffolding
└── (blocked: all other tasks depend on scaffold)

Wave 2 (After Task 1):
├── Task 2: Playwright Test Setup
├── Task 3: Theme Engine Core
├── Task 4: 3D Background System
└── Task 5: Wallet Integration (RainbowKit)

Wave 3 (After Wave 2):
├── Task 6: World ID Verification
├── Task 7: Agent Registration UI
├── Task 8: Yield Dashboard (Real-time)
├── Task 9: Transaction History (Local)
└── Task 10: Delegation Management

Wave 4 (After Wave 3):
├── Task 11: Arbitrage Trigger UI
├── Task 12: Theme Variants (Glass + Minimal)
├── Task 13: 3D Scene Variants
└── Task 14: Integration & Polish

Critical Path: Task 1 → Task 3 → Task 5 → Task 8 → Task 14
Parallel Speedup: ~60% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | All | None |
| 2 | 1 | 14 | 3, 4, 5 |
| 3 | 1 | 6, 7, 8, 9, 10, 12 | 2, 4, 5 |
| 4 | 1 | 13 | 2, 3, 5 |
| 5 | 1 | 6, 7, 8, 10, 11 | 2, 3, 4 |
| 6 | 3, 5 | 7 | 8, 9, 10 |
| 7 | 5, 6 | 14 | 8, 9, 10 |
| 8 | 3, 5 | 11 | 6, 7, 9, 10 |
| 9 | 3 | 14 | 6, 7, 8, 10 |
| 10 | 3, 5 | 11 | 6, 7, 8, 9 |
| 11 | 8, 10 | 14 | 12, 13 |
| 12 | 3 | 14 | 11, 13 |
| 13 | 4 | 14 | 11, 12 |
| 14 | 2, 7, 9, 11, 12, 13 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | `delegate_task(category="quick", load_skills=["frontend-ui-ux"])` |
| 2 | 2, 3, 4, 5 | `delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux", "playwright"], run_in_background=true)` |
| 3 | 6, 7, 8, 9, 10 | `delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux"])` |
| 4 | 11, 12, 13, 14 | `delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux", "playwright"])` |

---

## TODOs

### Wave 1: Foundation

- [x] 1. Next.js Project Scaffolding

  **What to do**:
  - Create Next.js 14 app with App Router in `web/` directory
  - Configure TypeScript strict mode
  - Install and configure Tailwind CSS
  - Install core dependencies: `framer-motion`, `@react-three/fiber`, `@react-three/drei`, `wagmi`, `viem`, `@rainbow-me/rainbowkit`, `zustand`
  - Create folder structure: `app/`, `components/`, `hooks/`, `lib/`, `stores/`, `types/`, `styles/`
  - Create `.env.example` with all required variables
  - Copy ABIs from `contracts/out/` (requires `forge build` first)
  - Create `lib/contracts.ts` with typed contract configs

  **Must NOT do**:
  - Do not create any UI components yet (just structure)
  - Do not hardcode any contract addresses

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard scaffolding task with well-defined steps
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Next.js and modern frontend setup expertise

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (alone)
  - **Blocks**: All other tasks
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `agent/superchain.ts:1-100` - Chain configuration pattern (copy env var naming convention)
  - `contracts/src/AgentRegistry.sol:1-50` - Contract interface for ABI extraction

  **API/Type References**:
  - `agent/superchain.ts:3-21` - TypeScript types for chain config (SuperchainKey, SuperchainContracts)

  **Documentation References**:
  - `README.md:Quick Start` - Environment variable names required
  - `doc/PROJECT_VISION.md:94-104` - Expected folder structure reference

  **External References**:
  - Next.js 14 App Router docs: https://nextjs.org/docs/app
  - RainbowKit docs: https://www.rainbowkit.com/docs/installation
  - Wagmi v2 docs: https://wagmi.sh/react/getting-started

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  cd web && npm run dev &
  sleep 10
  curl -s http://localhost:3000 | grep -q "html"
  echo "Exit code: $?"
  # Assert: Exit code 0 (page loads)
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing `npm run dev` starts without errors
  - [ ] `curl` response confirms HTML is served

  **Commit**: YES
  - Message: `feat(web): scaffold Next.js 14 app with core dependencies`
  - Files: `web/*`
  - Pre-commit: `cd web && npm run build`

---

### Wave 2: Core Systems

- [x] 2. Playwright Test Setup

  **What to do**:
  - Install Playwright: `npm init playwright@latest`
  - Configure `playwright.config.ts` for Next.js (baseURL, webServer)
  - Create `tests/` directory structure
  - Create test utilities:
    - `tests/utils/wallet-mock.ts` - Mock wallet connections
    - `tests/utils/fixtures.ts` - Common test fixtures
  - Write basic smoke test: `tests/smoke.spec.ts`
    - Navigate to homepage
    - Verify page title
    - Take screenshot

  **Must NOT do**:
  - Do not write feature tests yet (just setup)
  - Do not mock contract calls yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Playwright setup with clear steps
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: Browser automation expertise
    - `frontend-ui-ux`: Understanding of test structure

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5)
  - **Blocks**: Task 14
  - **Blocked By**: Task 1

  **References**:

  **External References**:
  - Playwright docs: https://playwright.dev/docs/intro
  - Playwright Next.js guide: https://playwright.dev/docs/test-webserver

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  cd web && npx playwright test tests/smoke.spec.ts --reporter=list
  # Assert: "1 passed" in output
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing "1 passed"
  - [ ] Screenshot file in `web/test-results/`

  **Commit**: YES
  - Message: `test(web): add Playwright test infrastructure`
  - Files: `web/playwright.config.ts`, `web/tests/*`
  - Pre-commit: `cd web && npx playwright test`

---

- [x] 3. Theme Engine Core

  **What to do**:
  - Create `stores/theme-store.ts` with Zustand:
    - State: `theme: 'cyberpunk' | 'glass' | 'minimal'`
    - Action: `setTheme(theme)`
    - Persist to localStorage
  - Create `styles/themes/` directory with CSS variable files:
    - `cyberpunk.css` - Neon colors, dark bg, glow effects
    - `glass.css` - Soft gradients, frosted effects
    - `minimal.css` - High contrast, monospace
  - Create `components/providers/ThemeProvider.tsx`:
    - Apply CSS variables to `:root`
    - Wrap app with provider
  - Create `components/ui/ThemeSwitcher.tsx`:
    - 3-way toggle with icons
    - Animated transition between themes
  - Update `app/layout.tsx` to use ThemeProvider

  **Must NOT do**:
  - Do not implement 3D scene switching yet (separate task)
  - Do not create all UI components (just theme infra)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Core visual system requiring design expertise
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: CSS architecture and design system knowledge

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4, 5)
  - **Blocks**: Tasks 6, 7, 8, 9, 10, 12
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - Create new pattern following modern CSS variables approach

  **External References**:
  - Zustand persist middleware: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
  - CSS custom properties: https://developer.mozilla.org/en-US/docs/Web/CSS/--*

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000
  2. Click: [data-testid="theme-switcher"]
  3. Select: "glass" theme option
  4. Assert: document.documentElement has CSS variable --theme-primary matching glass palette
  5. Refresh page
  6. Assert: Theme persists (still "glass")
  7. Screenshot: .sisyphus/evidence/task-3-theme-switch.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing theme switch UI
  - [ ] Browser console showing CSS variable change

  **Commit**: YES
  - Message: `feat(web): implement theme engine with 3 visual modes`
  - Files: `web/stores/theme-store.ts`, `web/styles/themes/*`, `web/components/providers/ThemeProvider.tsx`, `web/components/ui/ThemeSwitcher.tsx`
  - Pre-commit: `cd web && npm run build`

---

- [x] 4. 3D Background System

  **What to do**:
  - Create `components/three/` directory
  - Create `components/three/WebGLCheck.tsx`:
    - Detect WebGL support
    - Show error message if unsupported
  - Create `components/three/SceneContainer.tsx`:
    - React Three Fiber Canvas setup
    - Suspense boundary with loading state
    - Performance optimizations (frameloop="demand" when idle)
  - Create `components/three/backgrounds/CyberpunkScene.tsx`:
    - Neon grid floor
    - Floating particles
    - Ambient glow effects
  - Create `components/three/BackgroundManager.tsx`:
    - Subscribe to theme store
    - Conditionally render correct scene
    - Smooth transition between scenes (fade)
  - Update `app/layout.tsx` to include background

  **Must NOT do**:
  - Do not implement Glass or Minimal scenes yet (Task 13)
  - Do not block on 3D errors (show error message)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex 3D graphics requiring specialized knowledge
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: React Three Fiber and 3D web expertise

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3, 5)
  - **Blocks**: Task 13
  - **Blocked By**: Task 1

  **References**:

  **External References**:
  - React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
  - Drei helpers: https://github.com/pmndrs/drei
  - Three.js examples: https://threejs.org/examples/

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000
  2. Wait for: canvas element to be visible (3D loaded)
  3. Assert: canvas element exists in DOM
  4. Screenshot: .sisyphus/evidence/task-4-3d-background.png
  5. Assert: No console errors related to WebGL
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing 3D neon grid background
  - [ ] Console output confirming no WebGL errors

  **Commit**: YES
  - Message: `feat(web): add 3D background system with Cyberpunk scene`
  - Files: `web/components/three/*`
  - Pre-commit: `cd web && npm run build`

---

- [x] 5. Wallet Integration (RainbowKit)

  **What to do**:
  - Create `lib/wagmi.ts`:
    - Configure chains: Base Sepolia, OP Sepolia
    - Configure transports with env RPC URLs
    - Create wagmi config with RainbowKit
  - Create `components/providers/Web3Provider.tsx`:
    - WagmiProvider + QueryClientProvider + RainbowKitProvider
    - Theme customization to match app theme
  - Create `components/wallet/ConnectButton.tsx`:
    - Custom styled connect button
    - Show connected address with ENS resolution
    - Theme-aware styling
  - Create `hooks/useChainSwitch.ts`:
    - Switch between Base Sepolia and OP Sepolia
    - Show current chain indicator
  - Update `app/layout.tsx` to include Web3Provider

  **Must NOT do**:
  - Do not implement contract interactions yet
  - Do not add transaction signing UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Web3 integration with custom UI components
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Wagmi/RainbowKit integration patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 6, 7, 8, 10, 11
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `agent/superchain.ts:64-94` - Chain configuration with IDs and RPC URLs

  **Documentation References**:
  - `README.md:Environment Variables` - Required env var names

  **External References**:
  - RainbowKit theming: https://www.rainbowkit.com/docs/custom-theme
  - Wagmi v2 config: https://wagmi.sh/react/api/createConfig

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000
  2. Click: [data-testid="connect-wallet"]
  3. Assert: RainbowKit modal appears with wallet options
  4. Screenshot: .sisyphus/evidence/task-5-wallet-modal.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing wallet connection modal
  - [ ] Screenshot showing 3 wallet options (MetaMask, WalletConnect, Coinbase)

  **Commit**: YES
  - Message: `feat(web): integrate RainbowKit wallet connection`
  - Files: `web/lib/wagmi.ts`, `web/components/providers/Web3Provider.tsx`, `web/components/wallet/*`, `web/hooks/useChainSwitch.ts`
  - Pre-commit: `cd web && npm run build`

---

### Wave 3: Feature Implementation

- [x] 6. World ID Verification

  **What to do**:
  - Install World ID SDK: `@worldcoin/idkit`
  - Create `components/identity/WorldIDVerify.tsx`:
    - IDKitWidget integration
    - Handle verification callback
    - Store verification proof in state
  - Create `hooks/useWorldID.ts`:
    - Manage verification state
    - Persist verified status to localStorage
  - Create `app/verify/page.tsx`:
    - Full verification flow page
    - Success/failure states
    - Redirect after verification
  - Theme the World ID widget to match current theme

  **Must NOT do**:
  - Do not submit proof to on-chain verifier (mock for now)
  - Do not block other features on World ID

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Third-party SDK integration with custom UI
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: SDK integration and state management

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9, 10)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 3, 5

  **References**:

  **Documentation References**:
  - `doc/PROJECT_VISION.md:58-66` - World ID integration requirements
  - `README.md:User Flow - Act 1` - Verification flow description

  **External References**:
  - World ID IDKit docs: https://docs.worldcoin.org/id/idkit

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/verify
  2. Assert: World ID widget is visible
  3. Screenshot: .sisyphus/evidence/task-6-worldid.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing World ID verification widget

  **Commit**: YES
  - Message: `feat(web): add World ID verification flow`
  - Files: `web/components/identity/*`, `web/hooks/useWorldID.ts`, `web/app/verify/page.tsx`
  - Pre-commit: `cd web && npm run build`

---

- [x] 7. Agent Registration UI

  **What to do**:
  - Create `lib/contracts/agent-registry.ts`:
    - ABI import from copied file
    - Typed contract hooks using wagmi
  - Create `hooks/useAgentRegistry.ts`:
    - `useRegisterAgent(name, metadataURI)` - Write hook
    - `useGetAgent(agentId)` - Read hook
    - `useAgentByController(address)` - Read hook
    - `useAgentReputation(agentId)` - Read hook
  - Create `components/agent/RegisterAgentForm.tsx`:
    - Name input
    - Metadata URI input (or IPFS upload)
    - Submit button with loading state
    - Transaction confirmation UI
  - Create `components/agent/AgentCard.tsx`:
    - Display agent profile
    - Show reputation score
    - Show validation status
  - Create `app/agents/page.tsx`:
    - Registration form (if no agent)
    - Agent profile display (if registered)
    - List of all agents (discovery)

  **Must NOT do**:
  - Do not implement IPFS upload (manual URI input is fine)
  - Do not implement validator attestation UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Contract integration with form UI
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form design and contract interaction patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8, 9, 10)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 5, 6

  **References**:

  **Pattern References**:
  - `contracts/src/AgentRegistry.sol:42-63` - `registerAgent` function signature and events
  - `contracts/src/AgentRegistry.sol:70-73` - `getAgent` return type
  - `contracts/src/AgentRegistry.sol:177-179` - `hasAgent` helper

  **API/Type References**:
  - `contracts/src/IERC8004.sol` - AgentProfile struct definition

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/agents
  2. Assert: Registration form is visible (if no agent)
  3. Fill: input[name="agentName"] with "TestAgent"
  4. Fill: input[name="metadataURI"] with "ipfs://test"
  5. Assert: Submit button is enabled
  6. Screenshot: .sisyphus/evidence/task-7-agent-form.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing agent registration form
  - [ ] Screenshot showing agent card (if mock data available)

  **Commit**: YES
  - Message: `feat(web): add agent registration and profile UI`
  - Files: `web/lib/contracts/agent-registry.ts`, `web/hooks/useAgentRegistry.ts`, `web/components/agent/*`, `web/app/agents/page.tsx`
  - Pre-commit: `cd web && npm run build`

---

- [x] 8. Yield Dashboard (Real-time)

  **What to do**:
  - Create `lib/contracts/aave-pool.ts`:
    - ABI import
    - Contract address from env
  - Create `hooks/useYield.ts`:
    - `useCurrentBalance(user, asset)` - Reads MockAavePoolV2.getCurrentBalance
    - `useCalculateInterest(user, asset)` - Reads MockAavePoolV2.calculateInterest
    - `useLiquidityRate(asset)` - Reads current APY
    - Real-time polling (every 5 seconds) or block subscription
  - Create `components/yield/YieldTicker.tsx`:
    - Animated number display
    - Shows profit accruing in real-time
    - Framer Motion number animation
  - Create `components/yield/YieldDashboard.tsx`:
    - Principal amount
    - Accrued interest
    - Current APY
    - Deposit/Withdraw buttons
  - Create `components/three/YieldParticles.tsx`:
    - 3D particle effect representing yield accrual
    - Particle speed based on APY
  - Create `app/dashboard/page.tsx`:
    - Main yield dashboard page
    - Chain selector (Base vs OP)

  **Must NOT do**:
  - Do not implement deposit/withdraw transactions yet (UI only)
  - Do not fake the yield data (must read from contract)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Real-time data visualization with 3D elements
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Data visualization and contract polling patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 9, 10)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 3, 5

  **References**:

  **Pattern References**:
  - `contracts/src/MockAavePoolV2.sol:62-77` - `calculateInterest` logic (time-based)
  - `contracts/src/MockAavePoolV2.sol:85-89` - `getCurrentBalance` returns principal + interest
  - `contracts/src/MockAavePoolV2.sol:164-182` - `getReserveData` for APY

  **API/Type References**:
  - `contracts/src/interfaces/IAavePool.sol` - ReserveData struct

  **Documentation References**:
  - `doc/PROJECT_VISION.md:37-46` - Yield optimization description
  - `README.md:Act 2` - Real profit visualization requirement

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/dashboard
  2. Wait for: [data-testid="yield-ticker"] to be visible
  3. Assert: Yield ticker shows a number (not loading spinner)
  4. Wait: 6 seconds
  5. Assert: Yield ticker number has changed (real-time update)
  6. Screenshot: .sisyphus/evidence/task-8-yield-dashboard.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing yield dashboard with ticker
  - [ ] Two screenshots showing number change over time

  **Commit**: YES
  - Message: `feat(web): add real-time yield dashboard with 3D particles`
  - Files: `web/lib/contracts/aave-pool.ts`, `web/hooks/useYield.ts`, `web/components/yield/*`, `web/components/three/YieldParticles.tsx`, `web/app/dashboard/page.tsx`
  - Pre-commit: `cd web && npm run build`

---

- [x] 9. Transaction History (Local)

  **What to do**:
  - Create `stores/tx-history-store.ts`:
    - Zustand store with localStorage persistence
    - State: `transactions: Transaction[]`
    - Actions: `addTransaction`, `clearHistory`
  - Create `types/transaction.ts`:
    - Transaction type with hash, type, amount, timestamp, status
  - Create `hooks/useTxHistory.ts`:
    - Subscribe to wagmi transaction events
    - Auto-record new transactions to store
  - Create `components/history/TransactionList.tsx`:
    - List of past transactions
    - Grouped by date
    - Status indicators (pending, confirmed, failed)
  - Create `components/history/TransactionItem.tsx`:
    - Single transaction display
    - Link to block explorer
    - Copy hash button
  - Create `app/history/page.tsx`:
    - Full transaction history page
    - Filter by type
    - Clear history button

  **Must NOT do**:
  - Do not fetch history from backend (localStorage only)
  - Do not index historical on-chain events

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: State management with UI components
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Zustand patterns and list UI design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8, 10)
  - **Blocks**: Task 14
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `agent/superchain.ts:80,89` - Explorer URLs for transaction links

  **Documentation References**:
  - `doc/PROJECT_VISION.md:7` - Client-side history requirement
  - `README.md:Architecture` - LocalStorage for transaction history

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/history
  2. Assert: "No transactions" message OR transaction list visible
  3. Evaluate JS: localStorage.getItem('tx-history')
  4. Assert: localStorage key exists (store initialized)
  5. Screenshot: .sisyphus/evidence/task-9-tx-history.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing transaction history page
  - [ ] Console output showing localStorage key exists

  **Commit**: YES
  - Message: `feat(web): add localStorage-based transaction history`
  - Files: `web/stores/tx-history-store.ts`, `web/types/transaction.ts`, `web/hooks/useTxHistory.ts`, `web/components/history/*`, `web/app/history/page.tsx`
  - Pre-commit: `cd web && npm run build`

---

- [x] 10. Delegation Management

  **What to do**:
  - Create `lib/contracts/nexus-delegation.ts`:
    - ABI import
    - Contract hooks
  - Create `hooks/useDelegation.ts`:
    - `useSessionKeys()` - Read authorized keys
    - `useDailyLimit()` - Read spending limit
    - `useRemainingAllowance()` - Read remaining allowance
    - `useAuthorizeSessionKey(key, authorized, expiry)` - Write hook
  - Create `components/delegation/DelegationPanel.tsx`:
    - Current session keys list
    - Daily limit display
    - Remaining allowance display
    - Authorize/revoke session key form
  - Create `components/delegation/SessionKeyCard.tsx`:
    - Single session key display
    - Expiry countdown
    - Revoke button
  - Create `components/delegation/SecuritySandbox.tsx`:
    - Visual representation of security boundaries
    - Whitelisted protocols list
    - Spending limits visualization
  - Add to `app/dashboard/page.tsx` or create `app/delegation/page.tsx`

  **Must NOT do**:
  - Do not implement EIP-7702 signing (complex, out of scope for UI)
  - Do not implement social recovery UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Security-focused UI with contract reads
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Security UX patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8, 9)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 3, 5

  **References**:

  **Pattern References**:
  - `contracts/src/NexusDelegation.sol:13-14` - Session key mappings
  - `contracts/src/NexusDelegation.sol:90-103` - authorizeSessionKey functions
  - `contracts/src/NexusDelegation.sol:307-313` - getRemainingDailyAllowance

  **API/Type References**:
  - `contracts/src/NexusDelegation.sol:17-27` - Whitelist and limit mappings

  **Documentation References**:
  - `doc/PROJECT_VISION.md:28` - EIP-7702 + NexusDelegation description
  - `README.md:EIP-7702 Session Keys` - Session key explanation

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/dashboard (or /delegation)
  2. Assert: Delegation panel is visible
  3. Assert: Daily limit display shows a number
  4. Screenshot: .sisyphus/evidence/task-10-delegation.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing delegation management panel

  **Commit**: YES
  - Message: `feat(web): add delegation management panel`
  - Files: `web/lib/contracts/nexus-delegation.ts`, `web/hooks/useDelegation.ts`, `web/components/delegation/*`
  - Pre-commit: `cd web && npm run build`

---

### Wave 4: Polish & Integration

- [x] 11. Arbitrage Trigger UI

  **What to do**:
  - Create `hooks/useArbitrage.ts`:
    - Compare yield rates between Base and OP
    - Calculate potential profit
    - Determine optimal direction (Base→OP or OP→Base)
  - Create `components/arbitrage/ArbitragePanel.tsx`:
    - Show yield comparison between chains
    - Show profit opportunity
    - "Execute Rebalance" button
    - Transaction confirmation flow
  - Create `components/arbitrage/YieldComparison.tsx`:
    - Side-by-side chain comparison
    - Visual indicator of spread
  - Create `components/three/SuperchainGlobe.tsx`:
    - 3D globe with chain nodes
    - Animated connection lines
    - Highlight active arbitrage direction
  - Add to dashboard or create `app/arbitrage/page.tsx`

  **Must NOT do**:
  - Do not auto-execute arbitrage (manual trigger only)
  - Do not implement complex MEV protection

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex 3D visualization with data comparison
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Data visualization and 3D integration

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 8, 10

  **References**:

  **Pattern References**:
  - `agent/executor/arbitrage.ts` - Arbitrage logic reference (if exists)
  - `contracts/src/CrosschainBridge.sol` - Bridge contract for cross-chain execution

  **Documentation References**:
  - `README.md:Track A` - Autonomous arbitrage description
  - `doc/PROJECT_VISION.md:37-46` - Yield optimization flow

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/arbitrage (or dashboard)
  2. Assert: Yield comparison panel visible
  3. Assert: Two chain rates displayed
  4. Screenshot: .sisyphus/evidence/task-11-arbitrage.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot showing arbitrage panel with yield comparison
  - [ ] Screenshot showing 3D globe (if integrated)

  **Commit**: YES
  - Message: `feat(web): add arbitrage trigger UI with yield comparison`
  - Files: `web/hooks/useArbitrage.ts`, `web/components/arbitrage/*`, `web/components/three/SuperchainGlobe.tsx`
  - Pre-commit: `cd web && npm run build`

---

- [x] 12. Theme Variants (Glass + Minimal)

  **What to do**:
  - Complete `styles/themes/glass.css`:
    - Frosted glass effects (backdrop-blur)
    - Soft gradients
    - Muted color palette
    - Rounded corners
  - Complete `styles/themes/minimal.css`:
    - High contrast black/white
    - Monospace typography
    - Sharp corners
    - Minimal decorations
  - Update all components to use theme variables:
    - Buttons, cards, inputs, etc.
    - Ensure all components look correct in all 3 themes
  - Create `components/ui/Button.tsx` with theme variants
  - Create `components/ui/Card.tsx` with theme variants
  - Create `components/ui/Input.tsx` with theme variants

  **Must NOT do**:
  - Do not create component for every possible UI element
  - Do not over-abstract (keep it simple)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Pure visual design work
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: CSS theming and component design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 13)
  - **Blocks**: Task 14
  - **Blocked By**: Task 3

  **References**:

  **External References**:
  - Glassmorphism CSS: https://css.glass/
  - Tailwind backdrop-blur: https://tailwindcss.com/docs/backdrop-blur

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000
  2. Switch to: "glass" theme
  3. Screenshot: .sisyphus/evidence/task-12-glass.png
  4. Switch to: "minimal" theme
  5. Screenshot: .sisyphus/evidence/task-12-minimal.png
  6. Assert: Both screenshots show distinctly different styles
  ```

  **Evidence to Capture:**
  - [ ] Screenshot of Glass theme
  - [ ] Screenshot of Minimal theme

  **Commit**: YES
  - Message: `feat(web): complete Glass and Minimal theme variants`
  - Files: `web/styles/themes/*`, `web/components/ui/*`
  - Pre-commit: `cd web && npm run build`

---

- [x] 13. 3D Scene Variants

  **What to do**:
  - Create `components/three/backgrounds/GlassScene.tsx`:
    - Floating crystal/glass shards
    - Soft ambient lighting
    - Subtle reflections
  - Create `components/three/backgrounds/MinimalScene.tsx`:
    - Wireframe grid
    - Simple geometric shapes
    - High contrast lighting
  - Update `BackgroundManager.tsx`:
    - Switch scenes based on theme
    - Smooth transition animations
  - Optimize all scenes for performance:
    - Use instancing for repeated objects
    - Implement level-of-detail
    - Pause rendering when tab inactive

  **Must NOT do**:
  - Do not make scenes too heavy (target 60fps)
  - Do not use complex shaders unless necessary

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Advanced 3D graphics work
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: React Three Fiber and 3D optimization

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 12)
  - **Blocks**: Task 14
  - **Blocked By**: Task 4

  **References**:

  **External References**:
  - Three.js instancing: https://threejs.org/docs/#api/en/objects/InstancedMesh
  - R3F performance: https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance

  **Acceptance Criteria**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000
  2. Switch to: "glass" theme
  3. Assert: Canvas shows glass/crystal scene (different from cyberpunk)
  4. Screenshot: .sisyphus/evidence/task-13-glass-3d.png
  5. Switch to: "minimal" theme
  6. Assert: Canvas shows wireframe scene
  7. Screenshot: .sisyphus/evidence/task-13-minimal-3d.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshot of Glass 3D scene
  - [ ] Screenshot of Minimal 3D scene

  **Commit**: YES
  - Message: `feat(web): add Glass and Minimal 3D background scenes`
  - Files: `web/components/three/backgrounds/*`, `web/components/three/BackgroundManager.tsx`
  - Pre-commit: `cd web && npm run build`

---

- [x] 14. Integration & Polish

  **What to do**:
  - Create main `app/page.tsx` (landing/home):
    - Hero section with 3D background
    - Feature highlights
    - Connect wallet CTA
    - Theme switcher in header
  - Create `components/layout/Header.tsx`:
    - Logo
    - Navigation links
    - Wallet connect button
    - Theme switcher
  - Create `components/layout/Footer.tsx`:
    - Links to docs
    - Social links
  - Create navigation structure:
    - Home → Dashboard → Agents → History
  - Write comprehensive Playwright tests:
    - Full user flow: connect → verify → register → dashboard
    - Theme switching persistence
    - Navigation between pages
  - Fix any visual bugs across all themes
  - Ensure responsive design (desktop priority)
  - Create `app/error.tsx` and `app/not-found.tsx`

  **Must NOT do**:
  - Do not add features not in scope
  - Do not over-polish (production-ready, not perfect)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Final integration requiring full-stack frontend knowledge
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Layout and navigation design
    - `playwright`: Comprehensive E2E testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, sequential)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 2, 7, 9, 11, 12, 13

  **References**:

  **Documentation References**:
  - `README.md:User Flow` - Complete user journey

  **Acceptance Criteria**:

  ```bash
  # Agent runs full test suite:
  cd web && npx playwright test --reporter=html
  # Assert: All tests pass
  # Assert: Test report generated at web/playwright-report/
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000
  2. Assert: Hero section visible
  3. Navigate through: Dashboard, Agents, History
  4. Assert: All pages load without errors
  5. Screenshot each page: .sisyphus/evidence/task-14-*.png
  ```

  **Evidence to Capture:**
  - [ ] Playwright test report showing all passes
  - [ ] Screenshots of all main pages

  **Commit**: YES
  - Message: `feat(web): complete integration with landing page and E2E tests`
  - Files: `web/app/page.tsx`, `web/components/layout/*`, `web/tests/*`, `web/app/error.tsx`, `web/app/not-found.tsx`
  - Pre-commit: `cd web && npm run build && npx playwright test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(web): scaffold Next.js 14 app with core dependencies` | `web/*` | `npm run build` |
| 2 | `test(web): add Playwright test infrastructure` | `web/playwright.config.ts`, `web/tests/*` | `npx playwright test` |
| 3 | `feat(web): implement theme engine with 3 visual modes` | `web/stores/*`, `web/styles/*`, `web/components/providers/*` | `npm run build` |
| 4 | `feat(web): add 3D background system with Cyberpunk scene` | `web/components/three/*` | `npm run build` |
| 5 | `feat(web): integrate RainbowKit wallet connection` | `web/lib/wagmi.ts`, `web/components/wallet/*` | `npm run build` |
| 6 | `feat(web): add World ID verification flow` | `web/components/identity/*`, `web/app/verify/*` | `npm run build` |
| 7 | `feat(web): add agent registration and profile UI` | `web/lib/contracts/*`, `web/components/agent/*` | `npm run build` |
| 8 | `feat(web): add real-time yield dashboard with 3D particles` | `web/components/yield/*`, `web/app/dashboard/*` | `npm run build` |
| 9 | `feat(web): add localStorage-based transaction history` | `web/stores/*`, `web/components/history/*` | `npm run build` |
| 10 | `feat(web): add delegation management panel` | `web/components/delegation/*` | `npm run build` |
| 11 | `feat(web): add arbitrage trigger UI with yield comparison` | `web/components/arbitrage/*` | `npm run build` |
| 12 | `feat(web): complete Glass and Minimal theme variants` | `web/styles/*`, `web/components/ui/*` | `npm run build` |
| 13 | `feat(web): add Glass and Minimal 3D background scenes` | `web/components/three/backgrounds/*` | `npm run build` |
| 14 | `feat(web): complete integration with landing page and E2E tests` | `web/app/*`, `web/components/layout/*`, `web/tests/*` | `npx playwright test` |

---

## Success Criteria

### Verification Commands
```bash
cd web
npm run build                    # Expected: Build succeeds
npm run dev &                    # Expected: Server starts on :3000
npx playwright test              # Expected: All tests pass
```

### Final Checklist
- [x] All 14 tasks completed
- [x] All Playwright tests pass
- [x] Theme switcher works across all 3 themes
- [x] 3D backgrounds change with theme
- [x] Wallet connects with all 3 supported wallets
- [x] Yield dashboard shows real contract data
- [x] Transaction history persists in localStorage
- [x] No console errors in production build
- [x] Responsive design works on desktop

### Environment Variables Required
```bash
# web/.env.local
NEXT_PUBLIC_WORLD_APP_ID=app_...
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_AAVE_POOL_BASE_SEPOLIA=0x...
NEXT_PUBLIC_AAVE_POOL_OP_SEPOLIA=0x...
NEXT_PUBLIC_COMPOUND_COMET_BASE_SEPOLIA=0x...
NEXT_PUBLIC_COMPOUND_COMET_OP_SEPOLIA=0x...
NEXT_PUBLIC_CROSSCHAIN_BRIDGE_BASE_SEPOLIA=0x...
NEXT_PUBLIC_CROSSCHAIN_BRIDGE_OP_SEPOLIA=0x...
NEXT_PUBLIC_SUPERCHAIN_ERC20_BASE_SEPOLIA=0x...
NEXT_PUBLIC_SUPERCHAIN_ERC20_OP_SEPOLIA=0x...
NEXT_PUBLIC_NEXUS_DELEGATION_ADDRESS=0x...
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://...
NEXT_PUBLIC_OP_SEPOLIA_RPC=https://...
```
