// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CrosschainBridge.sol";
import "../src/SuperchainERC20.sol";

contract ConfigureSuperchainBridge is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address localBridge = vm.envAddress("LOCAL_BRIDGE");
        address localToken = vm.envAddress("LOCAL_TOKEN");
        uint256 remoteChainId = vm.envUint("REMOTE_CHAIN_ID");
        address remoteBridge = vm.envAddress("REMOTE_BRIDGE");
        address remoteToken = vm.envAddress("REMOTE_TOKEN");

        vm.startBroadcast(deployerPrivateKey);

        SuperchainERC20(localToken).setBridge(localBridge);
        CrosschainBridge(localBridge).addSupportedChain(remoteChainId, remoteBridge);
        CrosschainBridge(localBridge).mapToken(remoteChainId, localToken, remoteToken);

        vm.stopBroadcast();
    }
}
