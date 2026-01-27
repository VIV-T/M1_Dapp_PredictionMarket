import Web3 from "web3";
import PredictionMarketABI from "../contracts/PredictionMarket.json"; 

// Instances partagées (Singletons)
let web3Instance = null;
let contractInstance = null;

const initWeb3 = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask n'est pas installé");
  }

  // Si déjà initialisé, on retourne les instances existantes
  if (web3Instance && contractInstance) {
    return { web3: web3Instance, predictionMarket: contractInstance };
  }

  // Sinon, on initialise une seule fois
  web3Instance = new Web3(window.ethereum);
  
  try {
    // Demander l'accès aux comptes si nécessaire
    await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // Adresse du contrat (Assure-toi qu'elle est à jour après chaque migrate --reset)
    const deployedAddress = "0x652740F9cd25ee4EeA1A00B037Db4f36BC277265"; 
    
    contractInstance = new web3Instance.eth.Contract(
      PredictionMarketABI.abi,
      deployedAddress
    );

    return { web3: web3Instance, predictionMarket: contractInstance };
  } catch (error) {
    // Reset les instances en cas d'erreur pour permettre une nouvelle tentative
    web3Instance = null;
    contractInstance = null;
    throw new Error("Accès refusé à MetaMask ou erreur d'initialisation");
  }
};

export { initWeb3 };