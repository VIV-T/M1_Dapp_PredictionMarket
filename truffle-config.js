module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      gasPrice: 1,
      outputFile: null,
    },
  },
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "london"
      },
    },
  },
};
