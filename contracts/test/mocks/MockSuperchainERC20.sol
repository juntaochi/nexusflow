// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../../src/ICrosschainERC20.sol";

contract MockSuperchainERC20 is ICrosschainERC20 {
    mapping(address => uint256) public balances;

    event CrosschainMint(address indexed to, uint256 amount, address indexed sender);
    event CrosschainBurn(address indexed from, uint256 amount, address indexed sender);

    function mint(address to, uint256 amount) external {
        balances[to] += amount;
    }

    function crosschainMint(address _to, uint256 _amount) external override {
        balances[_to] += _amount;
        emit CrosschainMint(_to, _amount, msg.sender);
    }

    function crosschainBurn(address _from, uint256 _amount) external override {
        require(balances[_from] >= _amount, "Insufficient balance");
        balances[_from] -= _amount;
        emit CrosschainBurn(_from, _amount, msg.sender);
    }
}
