// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./interfaces/IComet.sol";

interface IERC20MinimalComet {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title MockCometV2
 * @notice Mock Compound Comet with TIME-BASED INTEREST ACCRUAL
 * @dev Simulates realistic APY growth for demo purposes
 */
contract MockCometV2 is IComet {
    address public owner;
    uint256 public utilization;
    uint64 public supplyRatePerSecond;
    
    // User => Asset => Deposit Info
    mapping(address => mapping(address => DepositInfo)) public deposits;
    
    struct DepositInfo {
        uint256 principal;
        uint256 lastUpdateTime;
        uint256 accruedInterest;
    }
    
    uint256 constant SCALE = 1e18;
    uint256 constant SECONDS_PER_YEAR = 365 days;
    
    event Deposited(address indexed user, address indexed asset, uint256 amount);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount);
    event InterestAccrued(address indexed user, address indexed asset, uint256 interest);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function setRates(uint256 newUtilization, uint64 newSupplyRatePerSecond) external onlyOwner {
        utilization = newUtilization;
        supplyRatePerSecond = newSupplyRatePerSecond;
    }
    
    function getUtilization() external view override returns (uint256) {
        return utilization;
    }
    
    function getSupplyRate(uint256) external view override returns (uint64) {
        return supplyRatePerSecond;
    }
    
    /**
     * @notice Calculate current interest for a user
     */
    function calculateInterest(address user, address asset) public view returns (uint256) {
        DepositInfo storage info = deposits[user][asset];
        
        if (info.principal == 0 || info.lastUpdateTime == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - info.lastUpdateTime;
        
        // Interest = principal * supplyRatePerSecond * timeElapsed
        uint256 interest = (info.principal * uint256(supplyRatePerSecond) * timeElapsed) / SCALE;
        
        return interest;
    }
    
    /**
     * @notice Get current total balance (principal + interest)
     */
    function getCurrentBalance(address user, address asset) public view returns (uint256) {
        DepositInfo storage info = deposits[user][asset];
        uint256 pendingInterest = calculateInterest(user, asset);
        return info.principal + info.accruedInterest + pendingInterest;
    }
    
    function supply(address asset, uint256 amount) external override {
        // Accrue interest before modifying principal
        _accrueInterest(msg.sender, asset);
        
        require(IERC20MinimalComet(asset).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        DepositInfo storage info = deposits[msg.sender][asset];
        info.principal += amount;
        info.lastUpdateTime = block.timestamp;
        
        emit Deposited(msg.sender, asset, amount);
    }
    
    function withdraw(address asset, uint256 amount) external override {
        _accrueInterest(msg.sender, asset);
        
        DepositInfo storage info = deposits[msg.sender][asset];
        uint256 totalBalance = info.principal + info.accruedInterest;
        
        require(totalBalance >= amount, "Insufficient balance");
        
        if (info.accruedInterest >= amount) {
            info.accruedInterest -= amount;
        } else {
            uint256 remaining = amount - info.accruedInterest;
            info.accruedInterest = 0;
            info.principal -= remaining;
        }
        
        require(IERC20MinimalComet(asset).transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, asset, amount);
    }
    
    function _accrueInterest(address user, address asset) internal {
        uint256 interest = calculateInterest(user, asset);
        
        if (interest > 0) {
            DepositInfo storage info = deposits[user][asset];
            info.accruedInterest += interest;
            info.lastUpdateTime = block.timestamp;
            
            emit InterestAccrued(user, asset, interest);
        }
    }
}
