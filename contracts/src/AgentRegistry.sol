// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./IERC8004.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import "openzeppelin-contracts/contracts/utils/Pausable.sol";

/**
 * @title AgentRegistry
 * @notice ERC-8004 compliant registry for trustless AI agents.
 * @dev Implements agent registration (ERC721), reputation tracking, and discovery.
 */
contract AgentRegistry is IERC8004, ERC721URIStorage, Ownable2Step, Pausable {

    uint256 private _nextAgentId = 1;

    mapping(uint256 => AgentProfile) private _agents;
    mapping(address => uint256) public agentIdByController;
    mapping(uint256 => int256) public reputationScores;
    
    // Validation storage
    mapping(address => bool) public allowedValidators;
    mapping(uint256 => mapping(address => ValidationAttestation)) public attestations;
    
    // Threshold for reputation to be considered trusted without validation
    int256 public constant TRUST_THRESHOLD = 10;

    constructor() ERC721("NexusFlow Agent", "NFA") Ownable(msg.sender) {}

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
    function registerAgent(string calldata name, string calldata metadataURI) external whenNotPaused returns (uint256 agentId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(agentIdByController[msg.sender] == 0, "Controller already has an agent");
        
        agentId = _nextAgentId++;
        
        // Mint ERC721 Identity
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, metadataURI);

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
     * @notice Submit feedback with evidence (Reputation Signal).
     * @param agentId The agent's unique ID.
     * @param delta +1 or -1 (or weighted).
     * @param jobHash Hash of request+payment+response.
     * @param evidenceURI Link to the Execution Receipt.
     */
    function submitFeedback(uint256 agentId, int256 delta, bytes32 jobHash, string calldata evidenceURI) external {
        require(_agents[agentId].controller != address(0), "Agent does not exist");
        // For demo simplicity, we allow multiple feedbacks but restrict delta size
        require(delta >= -10 && delta <= 10, "Delta out of range");
        require(_agents[agentId].controller != msg.sender, "Cannot vote for own agent");
        
        reputationScores[agentId] += delta;
        
        emit ReputationSignal(agentId, msg.sender, delta, jobHash, evidenceURI);
    }

    /**
     * @notice Validator attestation for trust upgrade.
     * @param agentId Agent ID.
     * @param jobHash Job that was validated.
     * @param ok Result of validation.
     * @param evidenceURI Proof of validation.
     */
    function attest(uint256 agentId, bytes32 jobHash, bool ok, string calldata evidenceURI) external {
        require(allowedValidators[msg.sender], "Not an allowed validator");
        
        attestations[agentId][msg.sender] = ValidationAttestation({
            ok: ok,
            jobHash: jobHash,
            evidenceURI: evidenceURI,
            timestamp: uint64(block.timestamp)
        });

        // If attested OK, we mark the simplified profile as validated too
        if (ok) {
            _agents[agentId].validated = true;
        }

        emit AgentAttested(agentId, msg.sender, ok, jobHash, evidenceURI);
    }

    /**
     * @notice Admin manages validators.
     */
    function setValidator(address validator, bool allowed) external onlyOwner {
        allowedValidators[validator] = allowed;
    }

    /**
     * @notice Pause the contract (emergency stop).
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Check if an agent is trusted (Reputation > Threshold OR Validated).
     */
    function isTrusted(uint256 agentId) external view returns (bool) {
        if (_agents[agentId].validated) return true;
        if (reputationScores[agentId] >= TRUST_THRESHOLD) return true;
        return false;
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
        _setTokenURI(agentId, metadataURI);
        
        emit AgentURIUpdated(agentId, metadataURI);
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

    // Override for ERC721URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
