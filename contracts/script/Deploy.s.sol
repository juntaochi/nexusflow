// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/NexusDelegation.sol";
import "../src/AgentRegistry.sol";
import "../src/CrosschainBridge.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        NexusDelegation nexusDelegation = new NexusDelegation();
        console.log("NexusDelegation deployed at:", address(nexusDelegation));

        AgentRegistry agentRegistry = new AgentRegistry();
        console.log("AgentRegistry deployed at:", address(agentRegistry));

        CrosschainBridge crosschainBridge = new CrosschainBridge();
        console.log("CrosschainBridge deployed at:", address(crosschainBridge));

        vm.stopBroadcast();
    }
}
