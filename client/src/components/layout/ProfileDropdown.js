import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { initWeb3 } from "../../utils/web3";

export default function ProfileDropdown({ account }) {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState("0");
  const [stats, setStats] = useState({ total: 0, won: 0 });
  const dropdownRef = useRef(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Récupérer les données blockchain
  useEffect(() => {
    const fetchUserData = async () => {
      if (!account) return;
      try {
        const { web3, predictionMarket } = await initWeb3();
        
        // 1. Solde ETH
        const bal = await web3.eth.getBalance(account);
        setBalance(parseFloat(Web3.utils.fromWei(bal, "ether")).toFixed(4));

        // 2. Statistiques de paris
        const marketCount = await predictionMarket.methods.nextMarketId().call();
        let won = 0;
        let total = 0;

        for (let i = 0; i < marketCount; i++) {
          const bet = await predictionMarket.methods.userBets(i, account).call();
          if (parseInt(bet.amount) > 0) {
            total++;
            const m = await predictionMarket.methods.markets(i).call();
            // Si le marché est résolu et que le choix est le bon
            if (parseInt(m.stage) === 2 && parseInt(m.winningOutcome) === parseInt(bet.choice)) {
              won++;
            }
          }
        }
        setStats({ total, won });
      } catch (e) {
        console.error("Erreur stats profil:", e);
      }
    };

    if (isOpen) fetchUserData();
  }, [account, isOpen]);

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const logout = () => {
    // 1. On peut vider le localStorage si vous y stockiez l'adresse
    localStorage.removeItem('userAccount'); 

    // 2. On recharge la page pour réinitialiser tout l'état de l'application
    window.location.reload();
    
    // Note : Après le reload, l'app ne doit PAS appeler eth_requestAccounts automatiquement
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar-circle">
          {account.substring(2, 4).toUpperCase()}
        </div>
        <span className="address-display">{formatAddress(account)}</span>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▾</span>
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="menu-header">
            <h4>Mon Profil Web3</h4>
            <p className="full-address">{account}</p>
          </div>
          
          <div className="menu-stats">
            <div className="stat-item">
              <span className="label">💰 Solde Portefeuille</span>
              <span className="value">{balance} ETH</span>
            </div>
            <hr className="menu-divider" />
            <div className="stat-item">
              <span className="label">📊 Paris Effectués</span>
              <span className="value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="label">🏆 Paris Gagnés</span>
              <span className="value text-green-400">{stats.won}</span>
            </div>
            <div className="stat-item">
              <span className="label">🎯 Taux de Victoire</span>
              <span className="value">
                {stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          <button className="btn-logout" onClick={logout}>
            Déconnexion de l'App
          </button>
        </div>
      )}
    </div>
  );
}