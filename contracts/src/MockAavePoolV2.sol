// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./interfaces/IAavePool.sol";

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title MockAavePoolV2
 * @notice Mock Aave Pool with TIME-BASED INTEREST ACCRUAL
 * @dev Simulates realistic APY growth for demo purposes
 */
contract MockAavePoolV2 is IAavePool {
    address public owner;
    
    // Asset => Liquidity Rate (in Ray: 1e27 = 100%)
    mapping(address => uint128) public liquidityRates;
    
    // User => Asset => Deposit Info
    mapping(address => mapping(address => DepositInfo)) public deposits;
    
    struct DepositInfo {
        uint256 principal;        // Original deposit amount
        uint256 lastUpdateTime;   // Last time interest was calculated
        uint256 accruedInterest;  // Total accrued interest
    }
    
    uint256 constant RAY = 1e27;
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
    
    /**
     * @notice Set APY rate for an asset
     * @param asset The token address
     * @param rate APY in Ray (e.g., 3.2% = 32000000000000000000000000)
     */
    function setLiquidityRate(address asset, uint128 rate) external onlyOwner {
        liquidityRates[asset] = rate;
    }
    
    /**
     * @notice Calculate current interest for a user
     * @param user The user address
     * @param asset The token address
     * @return Total accrued interest since last update
     */
    function calculateInterest(address user, address asset) public view returns (uint256) {
        DepositInfo storage info = deposits[user][asset];
        
        if (info.principal == 0 || info.lastUpdateTime == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - info.lastUpdateTime;
        uint128 rate = liquidityRates[asset];
        
        // Interest = principal * (rate / RAY) * (timeElapsed / SECONDS_PER_YEAR)
        // Simplified: (principal * rate * timeElapsed) / (RAY * SECONDS_PER_YEAR)
        uint256 interest = (info.principal * uint256(rate) * timeElapsed) / (RAY * SECONDS_PER_YEAR);
        
        return interest;
    }
    
    /**
     * @notice Get current total balance (principal + interest)
     * @param user The user address
     * @param asset The token address
     * @return Total balance including accrued interest
     */
    function getCurrentBalance(address user, address asset) public view returns (uint256) {
        DepositInfo storage info = deposits[user][asset];
        uint256 pendingInterest = calculateInterest(user, asset);
        return info.principal + info.accruedInterest + pendingInterest;
    }
    
    /**
     * @notice Supply (deposit) tokens to earn interest
     * @param asset The token to deposit
     * @param amount Amount to deposit
     * @param onBehalfOf Address to credit the deposit to
     * @param referralCode Referral code (unused in mock)
     */
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external override {
        // Accrue interest before modifying principal
        _accrueInterest(onBehalfOf, asset);
        
        // Transfer tokens
        require(IERC20Minimal(asset).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update deposit
        DepositInfo storage info = deposits[onBehalfOf][asset];
        info.principal += amount;
        info.lastUpdateTime = block.timestamp;
        
        emit Deposited(onBehalfOf, asset, amount);
    }
    
    /**
     * @notice Withdraw tokens (principal + interest)
     * @param asset The token to withdraw
     * @param amount Amount to withdraw
     * @param to Address to send tokens to
     * @return Amount withdrawn
     */
    function withdraw(address asset, uint256 amount, address to) external override returns (uint256) {
        // Accrue interest first
        _accrueInterest(msg.sender, asset);
        
        DepositInfo storage info = deposits[msg.sender][asset];
        uint256 totalBalance = info.principal + info.accruedInterest;
        
        require(totalBalance >= amount, "Insufficient balance");
        
        // Deduct from accrued interest first, then principal
        if (info.accruedInterest >= amount) {
            info.accruedInterest -= amount;
        } else {
            uint256 remaining = amount - info.accruedInterest;
            info.accruedInterest = 0;
            info.principal -= remaining;
        }
        
        // Transfer tokens
        require(IERC20Minimal(asset).transfer(to, amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, asset, amount);
        
        return amount;
    }
    
    /**
     * @notice Internal: Accrue interest and update state
     */
    function _accrueInterest(address user, address asset) internal {
        uint256 interest = calculateInterest(user, asset);
        
        if (interest > 0) {
            DepositInfo storage info = deposits[user][asset];
            info.accruedInterest += interest;
            info.lastUpdateTime = block.timestamp;
            
            emit InterestAccrued(user, asset, interest);
        }
    }
    
    /**
     * @notice Get reserve data (for compatibility with Aave interface)
     */
    function getReserveData(address asset) external view override returns (ReserveData memory) {
        return ReserveData({
            configuration: IAavePool.ReserveConfigurationMap({ data: 0 }),
            liquidityIndex: uint128(RAY),
            currentLiquidityRate: liquidityRates[asset],
            variableBorrowIndex: 0,
            currentVariableBorrowRate: 0,
            currentStableBorrowRate: 0,
            lastUpdateTimestamp: uint40(block.timestamp),
            id: 0,
            aTokenAddress: address(0),
            stableDebtTokenAddress: address(0),
            variableDebtTokenAddress: address(0),
            interestRateStrategyAddress: address(0),
            accruedToTreasury: 0,
            unbacked: 0,
            isolationModeTotalDebt: 0
        });
    }
}
