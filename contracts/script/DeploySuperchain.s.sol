// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/NexusUSD.sol";
import "../src/CrosschainBridge.sol";
import "../src/NexusDelegation.sol";
import "../src/AgentRegistry.sol";

contract DeploySuperchain is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        vm.startBroadcast(deployerPrivateKey);

        // Deploy NexusDelegation
        NexusDelegation nexusDelegation = new NexusDelegation();
        console.log("NexusDelegation deployed at:", address(nexusDelegation));

        // Deploy AgentRegistry
        AgentRegistry agentRegistry = new AgentRegistry();
        console.log("AgentRegistry deployed at:", address(agentRegistry));

        // Deploy NexusUSD
        NexusUSD nusd = new NexusUSD();
        console.log("NexusUSD deployed at:", address(nusd));

        // Deploy CrosschainBridge
        CrosschainBridge bridge = new CrosschainBridge();
        console.log("CrosschainBridge deployed at:", address(bridge));

        // Set bridge in token
        nusd.setBridge(address(bridge));
        console.log("Bridge set in NexusUSD");

        // Example: Support Base Sepolia (if we are on OP Sepolia)
        // bridge.addSupportedChain(84532, address(bridge)); // Assuming same address via CREATE2
        // bridge.mapToken(84532, address(nusd), address(nusd));

        vm.stopBroadcast();
    }
}
