import React from "react";
import ProfileDropdown from "./ProfileDropdown";

export default function Header({ account, setAccount }) {
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
      } else {
        alert("Veuillez installer MetaMask !");
      }
    } catch (error) {
      console.error("Erreur de connexion", error);
    }
  };

  return (
    <header className="header">
      <div className="header-logo">
        🚀 <span>Bet</span>Chain
      </div>

      <div className="header-actions">
        {account ? (
          <ProfileDropdown account={account} />
        ) : (
          <button className="btn-primary" onClick={connectWallet}>
            Connecter MetaMask
          </button>
        )}
      </div>
    </header>
  );
}