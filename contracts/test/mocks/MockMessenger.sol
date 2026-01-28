// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MockMessenger {
    address public crossDomainMessageSender;
    uint256 public crossDomainMessageSource;

    event SentMessage(uint256 destination, address target, bytes message);

    function sendMessage(uint256 _destination, address _target, bytes calldata _message) external {
        emit SentMessage(_destination, _target, _message);
    }

    function setXDomainMessageSender(address _sender) external {
        crossDomainMessageSender = _sender;
    }

    function setXDomainMessageSource(uint256 _source) external {
        crossDomainMessageSource = _source;
    }
}
