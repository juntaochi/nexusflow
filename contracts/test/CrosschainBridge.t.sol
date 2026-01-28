// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/CrosschainBridge.sol";
import "./mocks/MockSuperchainERC20.sol";
import "./mocks/MockMessenger.sol";

contract CrosschainBridgeTest is Test {
    CrosschainBridge public bridge;
    MockSuperchainERC20 public localToken;
    MockSuperchainERC20 public remoteToken; 
    MockMessenger public messenger;

    address public user = address(0x1);
    address public remoteBridge = address(0x2);
    address public constant L2_MESSENGER = 0x4200000000000000000000000000000000000023;
    uint256 public constant REMOTE_CHAIN_ID = 84532; // Base Sepolia

    event BridgeInitiated(
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 destinationChainId
    );

    event BridgeCompleted(
        address indexed token,
        address indexed to,
        uint256 amount,
        uint256 sourceChainId
    );

    function setUp() public {
        // Deploy MockMessenger and etch code to the predeploy address
        MockMessenger implementation = new MockMessenger();
        vm.etch(L2_MESSENGER, address(implementation).code);
        messenger = MockMessenger(L2_MESSENGER);

        // Deploy Bridge
        bridge = new CrosschainBridge();

        // Deploy Tokens
        localToken = new MockSuperchainERC20();
        remoteToken = new MockSuperchainERC20();

        // Setup mappings
        bridge.addSupportedChain(REMOTE_CHAIN_ID, remoteBridge);
        bridge.mapToken(REMOTE_CHAIN_ID, address(localToken), address(remoteToken));

        // Mint tokens to user
        localToken.mint(user, 100 ether);
    }

    function testBridgeInitiatesTransfer() public {
        uint256 amount = 10 ether;

        vm.prank(user);
        
        vm.expectEmit(true, true, true, true);
        emit BridgeInitiated(address(localToken), user, user, amount, REMOTE_CHAIN_ID);
        
        bridge.bridge(address(localToken), user, amount, REMOTE_CHAIN_ID);

        // Verify balance decreased
        assertEq(localToken.balances(user), 90 ether);
    }

    function testCompleteBridgeMintsTokens() public {
        uint256 amount = 10 ether;

        // Configure messenger mock
        messenger.setXDomainMessageSender(remoteBridge);
        messenger.setXDomainMessageSource(REMOTE_CHAIN_ID);

        vm.prank(L2_MESSENGER);
        
        vm.expectEmit(true, true, true, true);
        emit BridgeCompleted(address(localToken), user, amount, REMOTE_CHAIN_ID);

        bridge.completeBridge(address(localToken), user, amount);

        // Verify balance increased (from initial 100)
        assertEq(localToken.balances(user), 110 ether);
    }

    function testCompleteBridgeUntrustedSenderReverts() public {
        messenger.setXDomainMessageSender(address(0xbad)); 
        messenger.setXDomainMessageSource(REMOTE_CHAIN_ID);

        vm.prank(L2_MESSENGER);
        vm.expectRevert("Invalid remote sender");
        bridge.completeBridge(address(localToken), user, 10 ether);
    }

    function testCompleteBridgeWrongSourceReverts() public {
        messenger.setXDomainMessageSender(remoteBridge);
        messenger.setXDomainMessageSource(999); 

        vm.prank(L2_MESSENGER);
        vm.expectRevert("Invalid remote sender");
        bridge.completeBridge(address(localToken), user, 10 ether);
    }

    function testCompleteBridgeNotMessengerReverts() public {
        vm.prank(user); 
        vm.expectRevert("Only messenger");
        bridge.completeBridge(address(localToken), user, 10 ether);
    }
}
