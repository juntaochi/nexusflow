#!/bin/bash

# NexusFlow Mock Data Initialization Script
# Sets realistic APY values for demo purposes

set -e

# Load environment variables
source .env

# Contract addresses
BASE_AAVE="0x27f813a82897E80025c20d778e9B888dac386623"
BASE_COMET="0xf7AAba4277056aeD151f597daa0aF3B779f26CD1"
BASE_TOKEN="0x1A54562813c35151a5e8cF4105221212ad97Bf52"

OP_AAVE="0x74abaEC9aB23e08069751b3b9CA47Ce3FEa17d38"
OP_COMET="0x619AeC8bB48357D967F06F2d1582592455782B29"
OP_TOKEN="0xaA6B7D1b89B05BEABD2F23baf0110806082D09a5"

echo "🚀 Initializing Mock APY Data..."
echo ""

# Base Sepolia - Set Aave to 3.2% APY
echo "📊 Base Sepolia Aave: Setting 3.2% APY..."
cast send $BASE_AAVE \
  "setLiquidityRate(address,uint128)" \
  $BASE_TOKEN \
  32000000000000000000000000 \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --legacy

# Base Sepolia - Set Compound to 2.8% APY
echo "📊 Base Sepolia Compound: Setting 2.8% APY..."
# 2.8% annual / 365 days / 24 hours / 3600 seconds = 8.878e-10 per second
# In 1e18 scale: 887800000
cast send $BASE_COMET \
  "setRates(uint256,uint64)" \
  800000000000000000 \
  887800000 \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --legacy

echo ""
echo "📊 OP Sepolia Aave: Setting 5.8% APY..."
cast send $OP_AAVE \
  "setLiquidityRate(address,uint128)" \
  $OP_TOKEN \
  58000000000000000000000000 \
  --rpc-url $OP_SEPOLIA_RPC \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --legacy

echo "📊 OP Sepolia Compound: Setting 4.5% APY..."
# 4.5% annual = 1.427e-9 per second = 1427000000 in 1e18 scale
cast send $OP_COMET \
  "setRates(uint256,uint64)" \
  750000000000000000 \
  1427000000 \
  --rpc-url $OP_SEPOLIA_RPC \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --legacy

echo ""
echo "✅ Mock data initialized!"
echo ""
echo "📈 Current APY Rates:"
echo "  Base Sepolia:"
echo "    - Aave:     3.2%"
echo "    - Compound: 2.8%"
echo "  OP Sepolia:"
echo "    - Aave:     5.8%"
echo "    - Compound: 4.5%"
echo ""
echo "🎯 Arbitrage Opportunities:"
echo "  - Aave spread:     2.6% (Base → OP)"
echo "  - Compound spread: 1.7% (Base → OP)"
echo ""
