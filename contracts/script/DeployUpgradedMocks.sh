#!/bin/bash

# Deploy MockAavePoolV2 and MockCometV2 with interest accrual

set -e

source .env

BASE_TOKEN="0x1A54562813c35151a5e8cF4105221212ad97Bf52"
OP_TOKEN="0xaA6B7D1b89B05BEABD2F23baf0110806082D09a5"

echo "🚀 Deploying Upgraded Mock Contracts (V2 with Interest Accrual)..."
echo ""

# Base Sepolia
echo "📍 Deploying to Base Sepolia..."
YIELD_TOKEN_ADDRESS=$BASE_TOKEN \
AAVE_LIQUIDITY_RATE=32000000000000000000000000 \
COMET_UTILIZATION=800000000000000000 \
COMET_SUPPLY_RATE=887800000 \
forge script script/DeployYieldMocksV2.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast \
  --legacy

echo ""

# OP Sepolia  
echo "📍 Deploying to OP Sepolia..."
YIELD_TOKEN_ADDRESS=$OP_TOKEN \
AAVE_LIQUIDITY_RATE=58000000000000000000000000 \
COMET_UTILIZATION=750000000000000000 \
COMET_SUPPLY_RATE=1427000000 \
forge script script/DeployYieldMocksV2.s.sol \
  --rpc-url $OP_SEPOLIA_RPC \
  --broadcast \
  --legacy

echo ""
echo "✅ Upgraded contracts deployed!"
echo ""
echo "⚠️  IMPORTANT: Update .env.local with new addresses from broadcast/*.json"
