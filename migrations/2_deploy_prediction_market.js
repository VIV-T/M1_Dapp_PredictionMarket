const PredictionMarket = artifacts.require("PredictionMarket");
const UMAOptimisticOracleMock = artifacts.require("UMAOptimisticOracleMock");

module.exports = async function (deployer) {
  try {
    const umaMock = await UMAOptimisticOracleMock.deployed();
    const eventDescription = "PSG vs OM, who wins?";
    const disputePeriod = 86400; // 1 jour en secondes

    await deployer.deploy(
      PredictionMarket,
      umaMock.address,
      eventDescription,
      disputePeriod
    );

    const predictionMarket = await PredictionMarket.deployed();
    console.log("PredictionMarket deployed at:", predictionMarket.address);
  } catch (error) {
    console.error("Erreur lors du déploiement de PredictionMarket :", error);
  }
};
