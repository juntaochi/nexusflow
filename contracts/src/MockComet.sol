// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC20MinimalComet {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

import "./interfaces/IComet.sol";

contract MockComet is IComet {
    address public owner;
    uint256 public utilization;
    uint64 public supplyRatePerSecond;
    mapping(address => uint256) public deposits;

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

    function supply(address asset, uint256 amount) external override {
        require(IERC20MinimalComet(asset).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        deposits[msg.sender] += amount;
    }

    function withdraw(address asset, uint256 amount) external override {
        uint256 balance = deposits[msg.sender];
        require(balance >= amount, "Insufficient balance");
        deposits[msg.sender] = balance - amount;
        require(IERC20MinimalComet(asset).transfer(msg.sender, amount), "Transfer failed");
    }
}
