const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS;

async function main() {
    const AutoWallet = await ethers.getContractFactory("EtherTransfer");
 
    // Start deployment, returning a promise that resolves to a contract object
    const auto_wallet = await AutoWallet.deploy(RECEIVER_ADDRESS, 5);
    console.log("Contract deployed to address:", auto_wallet.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });