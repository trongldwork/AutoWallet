To compile and deploy your smart contracts using Hardhat, follow these instructions:

1. Install Hardhat globally by running the following command in your terminal:
    ```
    npm install -g hardhat
    ```

2. Compile your smart contracts by running the following command:
    ```
    npx hardhat compile
    ```
3. Run the deployment script by executing the following command:
    ```
    npx hardhat run scripts/deploy.js --network <network-name>
    ```
    Replace `<network-name>` with the 'sepolia' to deploy on Sepolia Testnet, or 'hardhat' for test, also change it in `hardhat.config.cjs`

