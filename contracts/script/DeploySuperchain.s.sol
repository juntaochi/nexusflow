// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/NexusUSD.sol";
import "../src/CrosschainBridge.sol";
import "../src/NexusDelegation.sol";
import "../src/AgentRegistry.sol";

contract DeploySuperchain is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", address(0));
        uint256 treasuryMint = vm.envOr("TREASURY_MINT", uint256(0));
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

        if (treasury != address(0) && treasuryMint > 0) {
            nusd.mint(treasury, treasuryMint);
            console.log("Treasury minted:", treasury, treasuryMint);
        }

        vm.stopBroadcast();
    }
}
