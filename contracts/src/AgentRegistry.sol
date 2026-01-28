// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./IERC8004.sol";

/**
 * @title AgentRegistry
 * @notice ERC-8004 compliant registry for trustless AI agents.
 * @dev Implements agent registration, reputation tracking, and discovery.
 */
contract AgentRegistry is IERC8004 {
    uint256 private _nextAgentId = 1;
    
    mapping(uint256 => AgentProfile) private _agents;
    mapping(address => uint256) public agentIdByController;
    mapping(uint256 => int256) public reputationScores;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    event AgentRegistered(uint256 indexed agentId, address indexed controller, string name);
    event AgentUpdated(uint256 indexed agentId, string name, string metadataURI);
    event ReputationUpdated(uint256 indexed agentId, int256 delta, int256 newScore);
    event AgentValidated(uint256 indexed agentId, bool validated);

    modifier onlyController(uint256 agentId) {
        require(_agents[agentId].controller == msg.sender, "Not agent controller");
        _;
    }

    /**
     * @notice Register a new agent.
     * @param name Human-readable agent name.
     * @param metadataURI URI pointing to agent metadata (IPFS, HTTP, etc.).
     * @return agentId The unique ID assigned to this agent.
     */
    function registerAgent(string calldata name, string calldata metadataURI) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(agentIdByController[msg.sender] == 0, "Controller already has an agent");
        
        agentId = _nextAgentId++;
        
        _agents[agentId] = AgentProfile({
            name: name,
            metadataURI: metadataURI,
            controller: msg.sender,
            validated: false
        });
        
        agentIdByController[msg.sender] = agentId;
        reputationScores[agentId] = 0;
        
        emit AgentRegistered(agentId, msg.sender, name);
    }

    /**
     * @notice Get agent profile by ID.
     * @param agentId The agent's unique ID.
     * @return profile The agent's profile data.
     */
    function getAgent(uint256 agentId) external view returns (AgentProfile memory profile) {
        require(_agents[agentId].controller != address(0), "Agent does not exist");
        return _agents[agentId];
    }

    /**
     * @notice Update agent reputation (upvote/downvote).
     * @param agentId The agent's unique ID.
     * @param delta Positive for upvote, negative for downvote.
     */
    function updateReputation(uint256 agentId, int256 delta) external {
        require(_agents[agentId].controller != address(0), "Agent does not exist");
        require(delta == 1 || delta == -1, "Delta must be +1 or -1");
        require(!hasVoted[agentId][msg.sender], "Already voted for this agent");
        require(_agents[agentId].controller != msg.sender, "Cannot vote for own agent");
        
        hasVoted[agentId][msg.sender] = true;
        reputationScores[agentId] += delta;
        
        emit ReputationUpdated(agentId, delta, reputationScores[agentId]);
    }

    /**
     * @notice Update agent profile (controller only).
     * @param agentId The agent's unique ID.
     * @param name New name.
     * @param metadataURI New metadata URI.
     */
    function updateAgent(uint256 agentId, string calldata name, string calldata metadataURI) external onlyController(agentId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        
        _agents[agentId].name = name;
        _agents[agentId].metadataURI = metadataURI;
        
        emit AgentUpdated(agentId, name, metadataURI);
    }

    /**
     * @notice Validate an agent (governance/admin function).
     * @param agentId The agent's unique ID.
     * @param validated Whether the agent is validated.
     */
    function setValidated(uint256 agentId, bool validated) external {
        require(_agents[agentId].controller != address(0), "Agent does not exist");
        _agents[agentId].validated = validated;
        emit AgentValidated(agentId, validated);
    }

    /**
     * @notice Get the total number of registered agents.
     * @return count The number of agents.
     */
    function agentCount() external view returns (uint256 count) {
        return _nextAgentId - 1;
    }

    /**
     * @notice Check if an address has a registered agent.
     * @param controller The address to check.
     * @return exists True if the address has an agent.
     */
    function hasAgent(address controller) external view returns (bool exists) {
        return agentIdByController[controller] != 0;
    }

    /**
     * @notice Get agent reputation score.
     * @param agentId The agent's unique ID.
     * @return score The reputation score (can be negative).
     */
    function getReputation(uint256 agentId) external view returns (int256 score) {
        require(_agents[agentId].controller != address(0), "Agent does not exist");
        return reputationScores[agentId];
    }
}
