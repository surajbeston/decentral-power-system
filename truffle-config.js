const path = require('path')
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "glass vote athlete love tower trumpet scout mean horse tongue receive dress"


module.exports = {
  contracts_build_directory: path.join(__dirname, "vapp/src/contracts"),
  networks: {
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/51ee58fc0fa94ed29565e741714bf9ef")
      },
      network_id: 4
    }
  },
  compilers: {
     solc: {
       version: "0.6.2"
     }
  }
};
