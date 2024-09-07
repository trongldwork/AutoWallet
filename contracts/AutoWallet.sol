pragma solidity ^0.8.0;

contract EtherTransfer {
    address public owner;
    address public receiver;
    uint256 public feePercentage;

    event Deposit(address indexed sender, uint256 amount, uint256 fee, uint256 transferred);

    constructor(address _receiver, uint256 _feePercentage) {
        owner = msg.sender;
        receiver = _receiver;
        feePercentage = _feePercentage;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        uint256 fee = (msg.value * feePercentage) / 100;
        uint256 transferAmount = msg.value - fee;

        (bool success, ) = receiver.call{value: transferAmount}("");
        require(success, "Transfer to receiver failed");

        emit Deposit(msg.sender, msg.value, fee, transferAmount);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function setReceiver(address _newReceiver) public {
        require(msg.sender == owner, "Only the owner can change the receiver");
        receiver = _newReceiver;
    }

    function setFeePercentage(uint256 _newFeePercentage) public {
        require(msg.sender == owner, "Only the owner can change the fee percentage");
        require(_newFeePercentage <= 100, "Fee percentage must be <= 100");
        feePercentage = _newFeePercentage;
    }
}