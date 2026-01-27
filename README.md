Here are the cmd to run to be able to run the project:

- "truffle init" in the main folder : create the main architecture to deploy the contract (DONE)
- "npm init -f" in the client folder : to initialize the frontend architecture (DONE)

If you already have the project structure:
- "npm install" : to install all the necessary dependencies (ESSENTIAL TO RUN - dependencies not in the git...)
    => run this cmd at the root + in the "client/" folder to install all the dependencies properly.

- run "npm install web3 ethers react-router-dom" in client folder

- "truffle compile" : to compile the contract written 
- "truffle migrate --reset --network development" : to deploy the contract and be able to use them in the dapp.

- Change the contract address in the client/src/utils/web3.js with the address of the recently deployed contract. 
- In client\src\components\market\OracleAdmin.js add the ADMIN_PASSWORD / ORACLE_PRIVATE_KEY (which is the private of the first account initialized in Ganache) / CONTRACT_ADDRESS (which is the adress of the contract deployed)

To run the front end :
- "npm run deploy" : deployement of the smart contract + copy into the front end to be able to use it
- change the contract address in web3.js with contract address that you can find in ganache + in OracleAdmin.js 
- "npm start" to start the application

