// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Minimal interface for Compound V3 Comet
interface IComet {
    function supply(address asset, uint256 amount) external;
    function withdraw(address asset, uint256 amount) external;
    function getUtilization() external view returns (uint256);
    function getSupplyRate(uint256 utilization) external view returns (uint64);
}
