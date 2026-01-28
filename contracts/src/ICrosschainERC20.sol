// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title ICrosschainERC20
 * @notice Interface for SuperchainERC20 tokens with native interoperability.
 */
interface ICrosschainERC20 {
    /**
     * @notice Burns tokens from sender for cross-chain transfer.
     * @param _from Address to burn from.
     * @param _amount Amount to burn.
     */
    function crosschainBurn(address _from, uint256 _amount) external;

    /**
     * @notice Mints tokens to recipient from cross-chain transfer.
     * @param _to Address to mint to.
     * @param _amount Amount to mint.
     */
    function crosschainMint(address _to, uint256 _amount) external;
}
