// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/MockAavePool.sol";
import "../src/MockComet.sol";

contract DeployYieldMocks is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address token = vm.envAddress("YIELD_TOKEN_ADDRESS");
        uint128 aaveLiquidityRate = uint128(vm.envOr("AAVE_LIQUIDITY_RATE", uint256(3e25)));
        uint256 cometUtilization = vm.envOr("COMET_UTILIZATION", uint256(8e17));
        uint64 cometSupplyRate = uint64(vm.envOr("COMET_SUPPLY_RATE", uint256(1e9)));

        vm.startBroadcast(deployerPrivateKey);

        MockAavePool aavePool = new MockAavePool();
        MockComet comet = new MockComet();

        aavePool.setLiquidityRate(token, aaveLiquidityRate);
        comet.setRates(cometUtilization, cometSupplyRate);

        console.log("MockAavePool deployed at:", address(aavePool));
        console.log("MockComet deployed at:", address(comet));

        vm.stopBroadcast();
    }
}
