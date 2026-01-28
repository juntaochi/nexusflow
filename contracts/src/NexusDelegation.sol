// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title NexusDelegation
 * @notice Target contract for EIP-7702 delegation with whitelist and spending limits.
 * @dev This contract will be executed via DELEGATECALL in the context of the EOA.
 */
contract NexusDelegation {
    address public owner;
    
    // Session key management
    mapping(address => bool) public sessionKeys;
    mapping(address => uint256) public sessionKeyExpiry;
    
    // Whitelist: only these protocols can be called by agents
    mapping(address => bool) public allowedTargets;
    
    // Spending limits (in wei for ETH, or smallest unit for tokens)
    uint256 public dailyLimit;
    uint256 public dailySpent;
    uint256 public lastResetDay;
    
    // Known protocol addresses on Base
    address public constant UNISWAP_V3_ROUTER = 0x2626664c2603336E57B271c5C0b26F421741e481;
    address public constant ZERO_X_EXCHANGE = 0xDef1C0ded9bec7F1a1670819833240f027b25EfF;
    address public constant AAVE_POOL = 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5;
    address public constant L2_MESSENGER = 0x4200000000000000000000000000000000000023;
    
    event SessionKeyAuthorized(address indexed key, bool authorized, uint256 expiry);
    event IntentExecuted(address indexed target, bytes data, uint256 value);
    event TargetAllowed(address indexed target, bool allowed);
    event DailyLimitSet(uint256 limit);
    event DailyLimitReset(uint256 newDay);

    modifier onlyOwner() {
        require(msg.sender == owner || msg.sender == address(this), "Not authorized");
        _;
    }

    modifier onlyValidSession() {
        require(sessionKeys[msg.sender], "Not an authorized agent");
        require(
            sessionKeyExpiry[msg.sender] == 0 || 
            block.timestamp <= sessionKeyExpiry[msg.sender],
            "Session expired"
        );
        _;
    }

    /**
     * @notice Initialize the delegation with sensible defaults.
     * @dev EIP-7702 requires init since storage is in the EOA.
     */
    function initialize(address _owner) external {
        require(owner == address(0), "Already initialized");
        owner = _owner;
        dailyLimit = 1 ether; // Default 1 ETH daily limit
        lastResetDay = block.timestamp / 1 days;
        
        // Pre-approve known safe protocols
        allowedTargets[UNISWAP_V3_ROUTER] = true;
        allowedTargets[ZERO_X_EXCHANGE] = true;
        allowedTargets[AAVE_POOL] = true;
    }

    /**
     * @notice Authorize a session key with optional expiry.
     * @param _key The agent's address.
     * @param _authorized Whether to authorize or revoke.
     * @param _expiry Unix timestamp when session expires (0 = no expiry).
     */
    function authorizeSessionKey(address _key, bool _authorized, uint256 _expiry) external onlyOwner {
        sessionKeys[_key] = _authorized;
        sessionKeyExpiry[_key] = _expiry;
        emit SessionKeyAuthorized(_key, _authorized, _expiry);
    }

    /**
     * @notice Legacy authorize function (no expiry).
     */
    function authorizeSessionKey(address _key, bool _authorized) external onlyOwner {
        sessionKeys[_key] = _authorized;
        sessionKeyExpiry[_key] = 0;
        emit SessionKeyAuthorized(_key, _authorized, 0);
    }

    /**
     * @notice Add or remove a protocol from the whitelist.
     */
    function setAllowedTarget(address _target, bool _allowed) external onlyOwner {
        allowedTargets[_target] = _allowed;
        emit TargetAllowed(_target, _allowed);
    }

    /**
     * @notice Set the daily spending limit.
     */
    function setDailyLimit(uint256 _limit) external onlyOwner {
        dailyLimit = _limit;
        emit DailyLimitSet(_limit);
    }

    /**
     * @notice Execute an intent with whitelist and limit checks.
     */
    function executeIntent(address _target, bytes calldata _data) external payable onlyValidSession {
        // Check whitelist
        require(allowedTargets[_target], "Target not whitelisted");
        
        // Check and update daily limit
        _checkAndUpdateDailyLimit(msg.value);
        
        // Execute the call
        (bool success, bytes memory returnData) = _target.call{value: msg.value}(_data);
        require(success, string(abi.encodePacked("Execution failed: ", returnData)));
        
        emit IntentExecuted(_target, _data, msg.value);
    }

    /**
     * @notice Execute multiple intents in a batch.
     */
    function executeBatch(
        address[] calldata _targets,
        bytes[] calldata _datas,
        uint256[] calldata _values
    ) external payable onlyValidSession {
        require(_targets.length == _datas.length && _datas.length == _values.length, "Length mismatch");
        
        uint256 totalValue = 0;
        for (uint256 i = 0; i < _targets.length; i++) {
            require(allowedTargets[_targets[i]], "Target not whitelisted");
            totalValue += _values[i];
        }
        
        _checkAndUpdateDailyLimit(totalValue);
        
        for (uint256 i = 0; i < _targets.length; i++) {
            (bool success, ) = _targets[i].call{value: _values[i]}(_datas[i]);
            require(success, "Batch execution failed");
            emit IntentExecuted(_targets[i], _datas[i], _values[i]);
        }
    }

    /**
     * @notice Execute an intent on a remote chain via L2ToL2CrossDomainMessenger.
     * @param _destinationChainId The destination chain ID.
     * @param _target The target contract on the destination chain.
     * @param _data The call data.
     */
    function sendCrossChainIntent(
        uint256 _destinationChainId,
        address _target,
        bytes calldata _data
    ) external payable onlyValidSession {
        _checkAndUpdateDailyLimit(msg.value);

        (bool success, ) = L2_MESSENGER.call{value: msg.value}(
            abi.encodeWithSignature(
                "sendMessage(uint256,address,bytes)",
                _destinationChainId,
                _target,
                _data
            )
        );
        require(success, "Cross-chain intent failed");
        
        emit IntentExecuted(L2_MESSENGER, _data, msg.value);
    }

    /**
     * @notice Check if daily limit allows this transaction.
     */
    function _checkAndUpdateDailyLimit(uint256 _value) internal {
        uint256 currentDay = block.timestamp / 1 days;
        
        // Reset daily spent if new day
        if (currentDay > lastResetDay) {
            dailySpent = 0;
            lastResetDay = currentDay;
            emit DailyLimitReset(currentDay);
        }
        
        require(dailySpent + _value <= dailyLimit, "Daily limit exceeded");
        dailySpent += _value;
    }

    /**
     * @notice Get remaining daily allowance.
     */
    function getRemainingDailyAllowance() external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay) {
            return dailyLimit;
        }
        return dailyLimit > dailySpent ? dailyLimit - dailySpent : 0;
    }

    /**
     * @notice Emergency withdrawal by owner.
     */
    function emergencyWithdraw(address _to, uint256 _amount) external onlyOwner {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Withdraw failed");
    }

    receive() external payable {}
}
