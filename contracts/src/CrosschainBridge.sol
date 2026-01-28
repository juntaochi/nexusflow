// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ICrosschainERC20.sol";

/**
 * @title IL2ToL2CrossDomainMessenger
 * @notice Interface for the OP Stack native cross-chain messenger.
 */
interface IL2ToL2CrossDomainMessenger {
    function sendMessage(
        uint256 _destination,
        address _target,
        bytes calldata _message
    ) external;

    function crossDomainMessageSender() external view returns (address);
    function crossDomainMessageSource() external view returns (uint256);
}

/**
 * @title CrosschainBridge
 * @notice Facilitates cross-chain token transfers using SuperchainERC20 and L2ToL2CrossDomainMessenger.
 * @dev Burns tokens on source chain, sends message to mint on destination chain.
 */
contract CrosschainBridge {
    // L2ToL2CrossDomainMessenger predeploy address
    address public constant L2_MESSENGER = 0x4200000000000000000000000000000000000023;

    // Mapping of token address on this chain to token address on other chains
    // chainId => localToken => remoteToken
    mapping(uint256 => mapping(address => address)) public tokenMappings;

    // Mapping of supported destination chains
    mapping(uint256 => bool) public supportedChains;

    // Bridge contract address on other chains (should be same address via CREATE2)
    mapping(uint256 => address) public remoteBridges;

    address public owner;

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

    event ChainSupported(uint256 chainId, address remoteBridge);
    event TokenMapped(uint256 chainId, address localToken, address remoteToken);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyMessenger() {
        require(msg.sender == L2_MESSENGER, "Only messenger");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Add support for a destination chain.
     * @param _chainId The chain ID to support.
     * @param _remoteBridge The bridge contract address on that chain.
     */
    function addSupportedChain(uint256 _chainId, address _remoteBridge) external onlyOwner {
        supportedChains[_chainId] = true;
        remoteBridges[_chainId] = _remoteBridge;
        emit ChainSupported(_chainId, _remoteBridge);
    }

    /**
     * @notice Map a local token to its remote counterpart.
     * @param _chainId Destination chain ID.
     * @param _localToken Token address on this chain.
     * @param _remoteToken Token address on destination chain.
     */
    function mapToken(uint256 _chainId, address _localToken, address _remoteToken) external onlyOwner {
        tokenMappings[_chainId][_localToken] = _remoteToken;
        emit TokenMapped(_chainId, _localToken, _remoteToken);
    }

    /**
     * @notice Bridge tokens to another chain.
     * @param _token The token to bridge.
     * @param _to Recipient address on destination chain.
     * @param _amount Amount to bridge.
     * @param _destinationChainId Destination chain ID.
     */
    function bridge(
        address _token,
        address _to,
        uint256 _amount,
        uint256 _destinationChainId
    ) external {
        require(supportedChains[_destinationChainId], "Chain not supported");
        
        address remoteToken = tokenMappings[_destinationChainId][_token];
        require(remoteToken != address(0), "Token not mapped");

        address remoteBridge = remoteBridges[_destinationChainId];
        require(remoteBridge != address(0), "Remote bridge not set");

        // Burn tokens on source chain
        ICrosschainERC20(_token).crosschainBurn(msg.sender, _amount);

        // Encode the mint call for the destination chain
        bytes memory message = abi.encodeWithSelector(
            this.completeBridge.selector,
            remoteToken,
            _to,
            _amount
        );

        // Send cross-chain message
        IL2ToL2CrossDomainMessenger(L2_MESSENGER).sendMessage(
            _destinationChainId,
            remoteBridge,
            message
        );

        emit BridgeInitiated(_token, msg.sender, _to, _amount, _destinationChainId);
    }

    /**
     * @notice Complete the bridge on destination chain (called by messenger).
     * @param _token Token address on this chain.
     * @param _to Recipient address.
     * @param _amount Amount to mint.
     */
    function completeBridge(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyMessenger {
        IL2ToL2CrossDomainMessenger messenger = IL2ToL2CrossDomainMessenger(L2_MESSENGER);
        
        // Verify the message came from a trusted remote bridge
        address remoteSender = messenger.crossDomainMessageSender();
        uint256 sourceChainId = messenger.crossDomainMessageSource();
        
        require(remoteSender == remoteBridges[sourceChainId], "Invalid remote sender");

        // Mint tokens on destination chain
        ICrosschainERC20(_token).crosschainMint(_to, _amount);

        emit BridgeCompleted(_token, _to, _amount, sourceChainId);
    }
}
