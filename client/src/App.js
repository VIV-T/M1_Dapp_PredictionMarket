import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MarketTabs from "./components/market/MarketTabs";
import Panel from "./components/market/Panel";
import OracleAdmin from "./components/market/OracleAdmin"; // Import de la page d'administration
import "./App.css";

export default function App() {
  const [account, setAccount] = useState(null);

  // 1. AUTO-LOGIN : Vérifie si MetaMask est déjà connecté au chargement
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de la connexion:", error);
        }
      }
    };
    checkConnection();

    // Écouter le changement de compte ou de réseau sur MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Recharger la page en cas de changement de réseau
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <Router>
      <div className="app-layout">
        {/* On passe l'état account pour gérer l'affichage des liens dans la Sidebar */}
        <Sidebar isConnected={!!account} account={account} /> 
        
        <div className="main-content">
          {/* Le Header gère la connexion/déconnexion */}
          <Header account={account} setAccount={setAccount} />
          
          <div className="content-wrapper">
            {/* Les onglets de navigation (Active / Pending / Resolved) */}
            <MarketTabs />
            
            <Routes>
              {/* Vues publiques et personnelles */}
              <Route path="/global/:status" element={<Panel view="GLOBAL" account={account} />} />
              <Route path="/personal/:status" element={<Panel view="PERSONAL" account={account} />} />
              
              {/* PAGE ADMIN ORACLE : Pour valider les résultats avec signature */}
              <Route path="/admin/oracle" element={<OracleAdmin account={account} />} />

              {/* Redirection par défaut vers les marchés actifs */}
              <Route path="/" element={<Navigate to="/global/active" replace />} />
              
              {/* Catch-all pour éviter les routes cassées */}
              <Route path="*" element={<Navigate to="/global/active" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}