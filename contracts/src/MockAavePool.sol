// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./interfaces/IAavePool.sol";

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract MockAavePool is IAavePool {
    address public owner;
    mapping(address => uint128) public liquidityRates;
    mapping(address => mapping(address => uint256)) public deposits;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setLiquidityRate(address asset, uint128 rate) external onlyOwner {
        liquidityRates[asset] = rate;
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        require(IERC20Minimal(asset).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        deposits[asset][onBehalfOf] += amount;
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        uint256 balance = deposits[asset][msg.sender];
        require(balance >= amount, "Insufficient balance");
        deposits[asset][msg.sender] = balance - amount;
        require(IERC20Minimal(asset).transfer(to, amount), "Transfer failed");
        return amount;
    }

    function getReserveData(address asset) external view override returns (ReserveData memory data) {
        data = ReserveData({
            configuration: IAavePool.ReserveConfigurationMap(0),
            liquidityIndex: 0,
            currentLiquidityRate: liquidityRates[asset],
            variableBorrowIndex: 0,
            currentVariableBorrowRate: 0,
            currentStableBorrowRate: 0,
            lastUpdateTimestamp: 0,
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
