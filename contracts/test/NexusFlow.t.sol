// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/NexusDelegation.sol";
import "../src/IERC8004.sol";

contract NexusFlowTest is Test {
    NexusDelegation public nexus;
    address public user = makeAddr("user");
    address public agent = makeAddr("agent");
    address public whitelistedTarget;

    event SessionKeyAuthorized(address indexed key, bool authorized, uint256 expiry);
    event IntentExecuted(address indexed target, bytes data, uint256 value);
    event TargetAllowed(address indexed target, bool allowed);
    event DailyLimitSet(uint256 limit);

    function setUp() public {
        nexus = new NexusDelegation();
        
        vm.prank(address(nexus));
        nexus.initialize(user);
        
        // Use one of the pre-approved targets
        whitelistedTarget = nexus.UNISWAP_V3_ROUTER();
    }

    function test_Authorization() public {
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true);
        
        assertTrue(nexus.sessionKeys(agent));
    }

    function test_AuthorizationWithExpiry() public {
        uint256 expiry = block.timestamp + 1 hours;
        
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true, expiry);
        
        assertTrue(nexus.sessionKeys(agent));
        assertEq(nexus.sessionKeyExpiry(agent), expiry);
    }

    function test_SessionExpiry() public {
        uint256 expiry = block.timestamp + 1 hours;
        
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true, expiry);

        // Warp past expiry
        vm.warp(expiry + 1);
        
        bytes memory data = abi.encodeWithSignature("swap()");
        
        vm.prank(agent);
        vm.expectRevert("Session expired");
        nexus.executeIntent(whitelistedTarget, data);
    }

    function test_Whitelist() public {
        // Pre-approved targets should work
        assertTrue(nexus.allowedTargets(nexus.UNISWAP_V3_ROUTER()));
        assertTrue(nexus.allowedTargets(nexus.ZERO_X_EXCHANGE()));
        assertTrue(nexus.allowedTargets(nexus.AAVE_POOL()));
    }

    function test_SetAllowedTarget() public {
        address newTarget = makeAddr("newProtocol");
        
        vm.prank(user);
        nexus.setAllowedTarget(newTarget, true);
        
        assertTrue(nexus.allowedTargets(newTarget));
    }

    function test_ExecuteIntent_Success() public {
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true);

        bytes memory data = abi.encodeWithSignature("swap()");
        
        vm.prank(agent);
        nexus.executeIntent(whitelistedTarget, data);
    }

    function test_ExecuteIntent_Revert_Unauthorized() public {
        bytes memory data = "0x1234";
        vm.prank(agent);
        vm.expectRevert("Not an authorized agent");
        nexus.executeIntent(whitelistedTarget, data);
    }

    function test_ExecuteIntent_Revert_NotWhitelisted() public {
        address badTarget = makeAddr("badTarget");
        
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true);

        bytes memory data = "0x1234";
        vm.prank(agent);
        vm.expectRevert("Target not whitelisted");
        nexus.executeIntent(badTarget, data);
    }

    function test_DailyLimit() public {
        // Default limit is 1 ether
        assertEq(nexus.dailyLimit(), 1 ether);
        
        vm.prank(user);
        nexus.setDailyLimit(5 ether);
        
        assertEq(nexus.dailyLimit(), 5 ether);
    }

    function test_DailyLimit_Exceeded() public {
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true);

        // Fund the agent (agent sends the ETH)
        vm.deal(agent, 10 ether);

        bytes memory data = abi.encodeWithSignature("swap()");
        
        // First call should succeed (1 ether = daily limit)
        vm.prank(agent);
        nexus.executeIntent{value: 0.5 ether}(whitelistedTarget, data);
        
        // Second call should exceed limit
        vm.prank(agent);
        vm.expectRevert("Daily limit exceeded");
        nexus.executeIntent{value: 0.6 ether}(whitelistedTarget, data);
    }

    function test_DailyLimit_Reset() public {
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true);

        // Fund the agent
        vm.deal(agent, 10 ether);
        bytes memory data = abi.encodeWithSignature("swap()");
        
        // Spend up to limit
        vm.prank(agent);
        nexus.executeIntent{value: 1 ether}(whitelistedTarget, data);
        
        // Should fail
        vm.prank(agent);
        vm.expectRevert("Daily limit exceeded");
        nexus.executeIntent{value: 0.1 ether}(whitelistedTarget, data);
        
        // Warp to next day
        vm.warp(block.timestamp + 1 days + 1);
        
        // Should work again
        vm.prank(agent);
        nexus.executeIntent{value: 0.5 ether}(whitelistedTarget, data);
    }

    function test_GetRemainingDailyAllowance() public {
        vm.prank(user);
        nexus.authorizeSessionKey(agent, true);

        assertEq(nexus.getRemainingDailyAllowance(), 1 ether);
        
        // Fund the agent
        vm.deal(agent, 10 ether);
        bytes memory data = abi.encodeWithSignature("swap()");
        
        vm.prank(agent);
        nexus.executeIntent{value: 0.3 ether}(whitelistedTarget, data);
        
        assertEq(nexus.getRemainingDailyAllowance(), 0.7 ether);
    }

    function test_EmergencyWithdraw() public {
        vm.deal(address(nexus), 5 ether);
        address recipient = makeAddr("recipient");
        
        vm.prank(user);
        nexus.emergencyWithdraw(recipient, 2 ether);
        
        assertEq(recipient.balance, 2 ether);
        assertEq(address(nexus).balance, 3 ether);
    }
}
