// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";
import "../src/IERC8004.sol";

contract AgentRegistryTest is Test {
    AgentRegistry public registry;
    address public agent1 = makeAddr("agent1");
    address public agent2 = makeAddr("agent2");
    address public voter = makeAddr("voter");

    event AgentRegistered(uint256 indexed agentId, address indexed controller, string name);
    event AgentUpdated(uint256 indexed agentId, string name, string metadataURI);
    event ReputationUpdated(uint256 indexed agentId, int256 delta, int256 newScore);
    event AgentValidated(uint256 indexed agentId, bool validated);

    function setUp() public {
        registry = new AgentRegistry();
    }

    function test_RegisterAgent() public {
        vm.prank(agent1);
        
        vm.expectEmit(true, true, false, true);
        emit AgentRegistered(1, agent1, "NexusFlow Agent");
        
        uint256 agentId = registry.registerAgent("NexusFlow Agent", "ipfs://QmTest123");
        
        assertEq(agentId, 1);
        assertEq(registry.agentCount(), 1);
        assertTrue(registry.hasAgent(agent1));
        
        IERC8004.AgentProfile memory profile = registry.getAgent(agentId);
        assertEq(profile.name, "NexusFlow Agent");
        assertEq(profile.metadataURI, "ipfs://QmTest123");
        assertEq(profile.controller, agent1);
        assertFalse(profile.validated);
    }

    function test_RegisterAgent_Revert_EmptyName() public {
        vm.prank(agent1);
        vm.expectRevert("Name cannot be empty");
        registry.registerAgent("", "ipfs://QmTest123");
    }

    function test_RegisterAgent_Revert_AlreadyRegistered() public {
        vm.prank(agent1);
        registry.registerAgent("Agent 1", "ipfs://Qm1");
        
        vm.prank(agent1);
        vm.expectRevert("Controller already has an agent");
        registry.registerAgent("Agent 2", "ipfs://Qm2");
    }

    function test_UpdateReputation_Upvote() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(voter);
        vm.expectEmit(true, false, false, true);
        emit ReputationUpdated(agentId, 1, 1);
        registry.updateReputation(agentId, 1);
        
        assertEq(registry.getReputation(agentId), 1);
    }

    function test_UpdateReputation_Downvote() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(voter);
        registry.updateReputation(agentId, -1);
        
        assertEq(registry.getReputation(agentId), -1);
    }

    function test_UpdateReputation_Revert_InvalidDelta() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(voter);
        vm.expectRevert("Delta must be +1 or -1");
        registry.updateReputation(agentId, 5);
    }

    function test_UpdateReputation_Revert_DoubleVote() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(voter);
        registry.updateReputation(agentId, 1);
        
        vm.prank(voter);
        vm.expectRevert("Already voted for this agent");
        registry.updateReputation(agentId, 1);
    }

    function test_UpdateReputation_Revert_SelfVote() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(agent1);
        vm.expectRevert("Cannot vote for own agent");
        registry.updateReputation(agentId, 1);
    }

    function test_UpdateAgent() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Old Name", "ipfs://Old");
        
        vm.prank(agent1);
        vm.expectEmit(true, false, false, true);
        emit AgentUpdated(agentId, "New Name", "ipfs://New");
        registry.updateAgent(agentId, "New Name", "ipfs://New");
        
        IERC8004.AgentProfile memory profile = registry.getAgent(agentId);
        assertEq(profile.name, "New Name");
        assertEq(profile.metadataURI, "ipfs://New");
    }

    function test_UpdateAgent_Revert_NotController() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test", "ipfs://Qm1");
        
        vm.prank(agent2);
        vm.expectRevert("Not agent controller");
        registry.updateAgent(agentId, "Hacked", "ipfs://Hacked");
    }

    function test_SetValidated() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.expectEmit(true, false, false, true);
        emit AgentValidated(agentId, true);
        registry.setValidated(agentId, true);
        
        IERC8004.AgentProfile memory profile = registry.getAgent(agentId);
        assertTrue(profile.validated);
    }

    function test_GetAgent_Revert_NotExists() public {
        vm.expectRevert("Agent does not exist");
        registry.getAgent(999);
    }

    function test_MultipleAgents() public {
        vm.prank(agent1);
        uint256 id1 = registry.registerAgent("Agent One", "ipfs://Qm1");
        
        vm.prank(agent2);
        uint256 id2 = registry.registerAgent("Agent Two", "ipfs://Qm2");
        
        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(registry.agentCount(), 2);
        assertEq(registry.agentIdByController(agent1), 1);
        assertEq(registry.agentIdByController(agent2), 2);
    }
}
