// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/MockAavePoolV2.sol";
import "../src/MockCometV2.sol";

contract DeployYieldMocksV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address token = vm.envAddress("YIELD_TOKEN_ADDRESS");
        uint128 aaveLiquidityRate = uint128(vm.envOr("AAVE_LIQUIDITY_RATE", uint256(3e25)));
        uint256 cometUtilization = vm.envOr("COMET_UTILIZATION", uint256(8e17));
        uint64 cometSupplyRate = uint64(vm.envOr("COMET_SUPPLY_RATE", uint256(1e9)));

        vm.startBroadcast(deployerPrivateKey);

        MockAavePoolV2 aavePool = new MockAavePoolV2();
        MockCometV2 comet = new MockCometV2();

        aavePool.setLiquidityRate(token, aaveLiquidityRate);
        comet.setRates(cometUtilization, cometSupplyRate);

        console.log("MockAavePoolV2 deployed at:", address(aavePool));
        console.log("MockCometV2 deployed at:", address(comet));

        vm.stopBroadcast();
    }
}
