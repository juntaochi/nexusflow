// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ICrosschainERC20.sol";

/**
 * @title SuperchainERC20
 * @notice ERC20 token with native Superchain interoperability (burn/mint model).
 * @dev Implements ICrosschainERC20 for cross-chain transfers via L2ToL2CrossDomainMessenger.
 */
contract SuperchainERC20 is ICrosschainERC20 {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // L2ToL2CrossDomainMessenger predeploy address (same on all OP Stack chains)
    address public constant L2_MESSENGER = 0x4200000000000000000000000000000000000023;

    // CrosschainBridge contract that can mint/burn
    address public bridge;
    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event CrosschainBurn(address indexed from, uint256 amount, uint256 destinationChainId);
    event CrosschainMint(address indexed to, uint256 amount, uint256 sourceChainId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyBridgeOrMessenger() {
        require(
            msg.sender == bridge || msg.sender == L2_MESSENGER,
            "Only bridge or messenger"
        );
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    /**
     * @notice Set the bridge contract address.
     */
    function setBridge(address _bridge) external onlyOwner {
        bridge = _bridge;
    }

    /**
     * @notice Mint initial supply to an address.
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    /**
     * @notice Standard ERC20 transfer.
     */
    function transfer(address _to, uint256 _amount) external returns (bool) {
        return _transfer(msg.sender, _to, _amount);
    }

    /**
     * @notice Standard ERC20 transferFrom.
     */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        uint256 currentAllowance = allowance[_from][msg.sender];
        require(currentAllowance >= _amount, "Insufficient allowance");
        allowance[_from][msg.sender] = currentAllowance - _amount;
        return _transfer(_from, _to, _amount);
    }

    /**
     * @notice Standard ERC20 approve.
     */
    function approve(address _spender, uint256 _amount) external returns (bool) {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
     * @notice Burns tokens from an address for cross-chain transfer.
     * @dev Only callable by the bridge contract.
     */
    function crosschainBurn(address _from, uint256 _amount) external onlyBridgeOrMessenger {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
        emit Transfer(_from, address(0), _amount);
    }

    /**
     * @notice Mints tokens to an address from cross-chain transfer.
     * @dev Only callable by the bridge contract or messenger.
     */
    function crosschainMint(address _to, uint256 _amount) external onlyBridgeOrMessenger {
        _mint(_to, _amount);
    }

    function _transfer(address _from, address _to, uint256 _amount) internal returns (bool) {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function _mint(address _to, uint256 _amount) internal {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
        emit Transfer(address(0), _to, _amount);
    }
}
