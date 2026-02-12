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
    address public validator = makeAddr("validator");

    event AgentRegistered(uint256 indexed agentId, address indexed controller, string name);
    event AgentURIUpdated(uint256 indexed agentId, string agentURI);
    event ReputationSignal(uint256 indexed agentId, address indexed rater, int256 delta, bytes32 jobHash, string evidenceURI);
    event AgentAttested(uint256 indexed agentId, address indexed validator, bool ok, bytes32 jobHash, string evidenceURI);

    function setUp() public {
        registry = new AgentRegistry();
        registry.setValidator(validator, true);
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

    function test_RegisterMultipleAgents_SameController() public {
        vm.startPrank(agent1);
        uint256 id1 = registry.registerAgent("Agent 1", "ipfs://Qm1");
        uint256 id2 = registry.registerAgent("Agent 2", "ipfs://Qm2");
        uint256 id3 = registry.registerAgent("Agent 3", "ipfs://Qm3");
        vm.stopPrank();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
        assertEq(registry.getAgentCount(agent1), 3);

        uint256[] memory agentIds = registry.getAgentsByController(agent1);
        assertEq(agentIds.length, 3);
        assertEq(agentIds[0], 1);
        assertEq(agentIds[1], 2);
        assertEq(agentIds[2], 3);
    }

    function test_UpdateReputation_Upvote() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        bytes32 jobHash = keccak256("job1");
        
        vm.prank(voter);
        vm.expectEmit(true, false, false, true);
        emit ReputationSignal(agentId, voter, 1, jobHash, "https://ev1");
        registry.submitFeedback(agentId, 1, jobHash, "https://ev1");
        
        assertEq(registry.getReputation(agentId), 1);
    }

    function test_UpdateReputation_Downvote() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(voter);
        registry.submitFeedback(agentId, -1, keccak256("job2"), "https://ev2");
        
        assertEq(registry.getReputation(agentId), -1);
    }

    function test_UpdateReputation_Revert_InvalidDelta() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(voter);
        vm.expectRevert("Delta out of range");
        registry.submitFeedback(agentId, 50, keccak256("job3"), "https://ev3");
    }

    function test_UpdateReputation_Revert_SelfVote() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Test Agent", "ipfs://Qm1");
        
        vm.prank(agent1);
        vm.expectRevert("Cannot vote for own agent");
        registry.submitFeedback(agentId, 1, keccak256("job4"), "https://ev4");
    }

    function test_UpdateAgent() public {
        vm.prank(agent1);
        uint256 agentId = registry.registerAgent("Old Name", "ipfs://Old");
        
        vm.prank(agent1);
        vm.expectEmit(true, false, false, true);
        emit AgentURIUpdated(agentId, "ipfs://New");
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
        
        bytes32 jobHash = keccak256("val1");
        
        vm.expectEmit(true, false, false, true);
        emit AgentAttested(agentId, validator, true, jobHash, "https://val1");
        
        vm.prank(validator);
        registry.attest(agentId, jobHash, true, "https://val1");
        
        IERC8004.AgentProfile memory profile = registry.getAgent(agentId);
        assertTrue(profile.validated);
        assertTrue(registry.isTrusted(agentId));
    }

    function test_GetAgent_Revert_NotExists() public {
        vm.expectRevert("Agent does not exist");
        registry.getAgent(999);
    }

    function test_MultipleAgents_DifferentControllers() public {
        vm.prank(agent1);
        uint256 id1 = registry.registerAgent("Agent One", "ipfs://Qm1");

        vm.prank(agent2);
        uint256 id2 = registry.registerAgent("Agent Two", "ipfs://Qm2");

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(registry.agentCount(), 2);

        uint256[] memory agent1Ids = registry.getAgentsByController(agent1);
        uint256[] memory agent2Ids = registry.getAgentsByController(agent2);
        assertEq(agent1Ids.length, 1);
        assertEq(agent2Ids.length, 1);
        assertEq(agent1Ids[0], 1);
        assertEq(agent2Ids[0], 2);
    }
}
