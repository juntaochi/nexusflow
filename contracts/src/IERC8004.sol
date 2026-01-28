// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IERC8004
 * @notice Interface for Trustless Agents standard.
 */
interface IERC8004 {
    struct AgentProfile {
        string name;
        string metadataURI;
        address controller;
        bool validated;
    }

    function registerAgent(string calldata name, string calldata metadataURI) external returns (uint256 agentId);
    function getAgent(uint256 agentId) external view returns (AgentProfile memory);
    function updateReputation(uint256 agentId, int256 delta) external;
}
