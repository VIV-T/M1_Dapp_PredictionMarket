const PredictionMarket = artifacts.require("PredictionMarket");

module.exports = async function (deployer, network, accounts) {
  try {
    // L'adresse qui aura le droit de signer les résultats (votre Oracle)
    // On prend le premier compte fourni par Truffle pour les tests locaux
    const oracleAddress = accounts[0]; 

    console.log("Déploiement avec l'adresse Oracle :", oracleAddress);

    // On déploie en ne passant QUE l'adresse de l'oracle
    await deployer.deploy(
      PredictionMarket,
      oracleAddress
    );

    const predictionMarket = await PredictionMarket.deployed();
    console.log("PredictionMarket déployé à l'adresse :", predictionMarket.address);
    
  } catch (error) {
    console.error("Erreur lors du déploiement de PredictionMarket :", error);
  }
};