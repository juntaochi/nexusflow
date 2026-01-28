// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./SuperchainERC20.sol";

/**
 * @title NexusUSD
 * @notice The native stablecoin of the NexusFlow ecosystem.
 * @dev Inherits SuperchainERC20 for seamless cross-chain mobility on the Superchain.
 */
contract NexusUSD is SuperchainERC20 {
    constructor() SuperchainERC20("Nexus USD", "NUSD") {
        // Mint initial supply to deployer for testing/liquidity
        _mint(msg.sender, 1_000_000 * 10**decimals);
    }
}
