// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IERC8004
 * @notice Interface for Trustless Agents standard.
 */
interface IERC8004 {
    struct AgentProfile {
        string name;
        string metadataURI; // agentURI / tokenURI
        address controller;
        bool validated;
    }

    // 8004 MVP+ Structs
    struct ValidationAttestation {
        bool ok;
        bytes32 jobHash;
        string evidenceURI;
        uint64 timestamp;
    }

    // Core Events
    event AgentRegistered(uint256 indexed agentId, address indexed controller, string name);
    event AgentURIUpdated(uint256 indexed agentId, string agentURI);
    event ReputationSignal(uint256 indexed agentId, address indexed rater, int256 delta, bytes32 jobHash, string evidenceURI);
    event AgentAttested(uint256 indexed agentId, address indexed validator, bool ok, bytes32 jobHash, string evidenceURI);
    
    // Core Functions
    function registerAgent(string calldata name, string calldata metadataURI) external returns (uint256 agentId);
    function getAgent(uint256 agentId) external view returns (AgentProfile memory);
    
    // Reputation & Validation
    function submitFeedback(uint256 agentId, int256 delta, bytes32 jobHash, string calldata evidenceURI) external;
    function attest(uint256 agentId, bytes32 jobHash, bool ok, string calldata evidenceURI) external;
    function isTrusted(uint256 agentId) external view returns (bool);
}
