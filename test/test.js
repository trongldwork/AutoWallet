import { expect } from "chai";

describe("EtherTransfer", function () {
  let etherTransfer;
  let owner, receiver, user1;
  const feePercentage = 10; // 10% fee

  beforeEach(async () => {
    [owner, receiver, user1] = await ethers.getSigners();
    
    const EtherTransfer = await ethers.getContractFactory("EtherTransfer");
    etherTransfer = await EtherTransfer.deploy(receiver.address, feePercentage);
    await etherTransfer.deployed();
  });

  it("should set the correct owner, receiver, and fee percentage", async () => {
    expect(await etherTransfer.owner()).to.equal(owner.address);
    expect(await etherTransfer.receiver()).to.equal(receiver.address);
    expect(await etherTransfer.feePercentage()).to.equal(feePercentage);
  });

  it("should allow deposits and transfer correct amounts", async () => {
    const depositAmount = ethers.utils.parseEther("1");
    const expectedFee = depositAmount.mul(feePercentage).div(100);
    const expectedTransfer = depositAmount.sub(expectedFee);

    const initialReceiverBalance = await ethers.provider.getBalance(receiver.address);

    const tx = await etherTransfer.connect(user1).deposit({ value: depositAmount });
    const receipt = await tx.wait();

    // Check emitted event
    const event = receipt.events.find(e => e.event === 'Deposit');
    expect(event.args.sender).to.equal(user1.address);
    expect(event.args.amount.toString()).to.equal(depositAmount.toString());
    expect(event.args.fee.toString()).to.equal(expectedFee.toString());
    expect(event.args.transferred.toString()).to.equal(expectedTransfer.toString());

    // Check receiver balance after the transfer
    const newReceiverBalance = await ethers.provider.getBalance(receiver.address);
    expect(newReceiverBalance.sub(initialReceiverBalance).toString()).to.equal(expectedTransfer.toString());
  });

  it("should allow owner to withdraw fees", async () => {
    const depositAmount = ethers.utils.parseEther("1");
    await etherTransfer.connect(user1).deposit({ value: depositAmount });

    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    const contractBalance = await ethers.provider.getBalance(etherTransfer.address);

    const tx = await etherTransfer.withdraw();
    const receipt = await tx.wait();
    
    const gasUsed = receipt.gasUsed;
    const gasPrice = await ethers.provider.getGasPrice();
    const gasCost = gasUsed.mul(gasPrice);

    const newOwnerBalance = await ethers.provider.getBalance(owner.address);

    // Owner's balance should increase by the contract balance minus gas cost
    expect(initialOwnerBalance.add(contractBalance).sub(gasCost).toString()).to.equal(newOwnerBalance.toString());
  });

  it("should allow the owner to set a new receiver", async () => {
    const newReceiver = ethers.Wallet.createRandom().address;
    await etherTransfer.setReceiver(newReceiver);
    expect(await etherTransfer.receiver()).to.equal(newReceiver);
  });

  it("should allow the owner to set a new fee percentage", async () => {
    const newFeePercentage = 20;
    await etherTransfer.setFeePercentage(newFeePercentage);
    expect(await etherTransfer.feePercentage()).to.equal(newFeePercentage);
  });

  it("should only allow the owner to withdraw fees", async () => {
    await expect(etherTransfer.connect(user1).withdraw()).to.be.revertedWith("Only the owner can withdraw");
  });

  it("should only allow the owner to set a new receiver", async () => {
    await expect(etherTransfer.connect(user1).setReceiver(user1.address)).to.be.revertedWith("Only the owner can change the receiver");
  });

  it("should only allow the owner to set a new fee percentage", async () => {
    await expect(etherTransfer.connect(user1).setFeePercentage(50)).to.be.revertedWith("Only the owner can change the fee percentage");
  });

  it("should revert if the fee percentage is greater than 100", async () => {
    await expect(etherTransfer.setFeePercentage(110)).to.be.revertedWith("Fee percentage must be <= 100");
  });
});
